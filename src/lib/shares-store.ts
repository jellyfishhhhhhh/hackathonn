import { useEffect, useState } from "react";

export type ShareSectionId =
  | "profil"
  | "istoric"
  | "documente"
  | "diplome"
  | "voluntariat"
  | "admitere";

export const SHARE_SECTIONS: { id: ShareSectionId; label: string; descriere: string }[] = [
  { id: "profil", label: "Profil educațional de bază", descriere: "Nume elev, școală, clasă, status elev." },
  { id: "istoric", label: "Istoric școlar", descriere: "Ani școlari, clase, unități de învățământ." },
  { id: "documente", label: "Documente educaționale", descriere: "Adeverințe, foi matricole, diplome și certificate." },
  { id: "diplome", label: "Diplome și certificate", descriere: "Premii, olimpiade, certificate lingvistice sau digitale." },
  { id: "voluntariat", label: "Voluntariat și activități extracurriculare", descriere: "Certificate de voluntariat și activități relevante." },
  { id: "admitere", label: "Dosar pentru admitere", descriere: "Pachet de documente pentru înscriere sau admitere." },
];

export const DEFAULT_SECTIONS: ShareSectionId[] = ["profil", "documente"];

export type ShareStatus = "Activ" | "Expirat" | "Revocat";

export type ShareLogEntry = {
  when: string; // dd.mm.yyyy, HH:MM
  text: string;
};

export type SharedLink = {
  id: string;
  childId: string;
  sections: ShareSectionId[];
  validityDays: 7 | 14 | 30;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  accessCode: string;
  requireCode: boolean;
  allowDownload: boolean;
  verificationOnly: boolean;
  status: ShareStatus;
  accessLog: ShareLogEntry[];
};

const KEY = "eelev_shares";
const SEQ_KEY = "eelev_shares_seq";
const EVT = "eelev:shares";

function formatRoDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatRoDateTime(d: Date) {
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${formatRoDate(d)}, ${time}`;
}

export function formatShareDate(iso: string) {
  return formatRoDate(new Date(iso));
}

function seed(): SharedLink[] {
  const now = new Date("2026-05-23T14:32:00");
  const gen1 = new Date("2026-05-23T14:32:00");
  const exp1 = new Date("2026-06-06T14:32:00");
  const gen2 = new Date("2026-05-20T10:15:00");
  const exp2 = new Date("2026-06-03T10:15:00"); // already in past relative to "today" simulation? keep as Expirat manually
  void now;
  return [
    {
      id: "SH-2026-00184",
      childId: "andrei-popescu",
      sections: ["profil", "documente"],
      validityDays: 14,
      createdAt: gen1.toISOString(),
      expiresAt: exp1.toISOString(),
      accessCode: "731204",
      requireCode: true,
      allowDownload: false,
      verificationOnly: true,
      status: "Activ",
      accessLog: [
        { when: "23.05.2026, 14:32", text: "Link de partajare generat pentru dosar educațional" },
        { when: "23.05.2026, 14:32", text: "Cod de acces creat" },
      ],
    },
    {
      id: "SH-2026-00171",
      childId: "andrei-popescu",
      sections: ["admitere", "documente", "diplome"],
      validityDays: 14,
      createdAt: gen2.toISOString(),
      expiresAt: exp2.toISOString(),
      accessCode: "408215",
      requireCode: true,
      allowDownload: true,
      verificationOnly: false,
      status: "Expirat",
      accessLog: [
        { when: "20.05.2026, 10:15", text: "Link de partajare generat pentru dosar admitere" },
        { when: "20.05.2026, 10:15", text: "Cod de acces creat" },
        { when: "22.05.2026, 09:04", text: "Dosarul partajat a fost accesat" },
      ],
    },
  ];
}

function read(): SharedLink[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    const seeded = seed();
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as SharedLink[];
  } catch {
    return [];
  }
}

function write(list: SharedLink[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
}

function recalcStatus(s: SharedLink): SharedLink {
  if (s.status === "Revocat") return s;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    if (s.status !== "Expirat") return { ...s, status: "Expirat" };
  }
  return s;
}

export function listShares(childId?: string): SharedLink[] {
  const all = read().map(recalcStatus);
  return childId ? all.filter((s) => s.childId === childId) : all;
}

export function getShareById(id: string): SharedLink | undefined {
  const found = read().find((s) => s.id === id);
  return found ? recalcStatus(found) : undefined;
}

function nextId(): string {
  if (typeof window === "undefined") return `SH-2026-00001`;
  const raw = window.localStorage.getItem(SEQ_KEY);
  const n = raw ? parseInt(raw, 10) + 1 : 200;
  window.localStorage.setItem(SEQ_KEY, String(n));
  return `SH-2026-${String(n).padStart(5, "0")}`;
}

export function createShare(input: {
  childId: string;
  sections: ShareSectionId[];
  validityDays: 7 | 14 | 30;
  requireCode: boolean;
  allowDownload: boolean;
  verificationOnly: boolean;
}): SharedLink {
  const now = new Date();
  const expires = new Date(now.getTime() + input.validityDays * 86400000);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const link: SharedLink = {
    id: nextId(),
    childId: input.childId,
    sections: input.sections,
    validityDays: input.validityDays,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    accessCode: code,
    requireCode: input.requireCode,
    allowDownload: input.allowDownload,
    verificationOnly: input.verificationOnly,
    status: "Activ",
    accessLog: [
      { when: formatRoDateTime(now), text: "Link de partajare generat pentru dosar educațional" },
      { when: formatRoDateTime(now), text: "Cod de acces creat" },
    ],
  };
  const list = read();
  write([link, ...list]);
  return link;
}

export function revokeShare(id: string) {
  const list = read().map((s) => {
    if (s.id !== id) return s;
    return {
      ...s,
      status: "Revocat" as const,
      accessLog: [
        ...s.accessLog,
        { when: formatRoDateTime(new Date()), text: "Accesul la link a fost revocat" },
      ],
    };
  });
  write(list);
}

export function markAccessed(id: string) {
  const list = read().map((s) => {
    if (s.id !== id) return s;
    return {
      ...s,
      accessLog: [
        ...s.accessLog,
        { when: formatRoDateTime(new Date()), text: "Dosarul partajat a fost accesat" },
      ],
    };
  });
  write(list);
}

export function useShares(childId?: string): SharedLink[] {
  const [list, setList] = useState<SharedLink[]>(() => listShares(childId));
  useEffect(() => {
    const handler = () => setList(listShares(childId));
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [childId]);
  return list;
}
