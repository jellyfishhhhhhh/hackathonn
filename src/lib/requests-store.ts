import { useEffect, useState } from "react";

export type RequestType =
  | "adeverinta"
  | "scutire-medicala"
  | "invoire"
  | "beneficiu"
  | "dosar-admitere";

export type AuditEntry = {
  at: string; // ISO
  actor: string;
  action: string;
  method?: string;
};

export type StoredRequest = {
  id: string; // EE-YYYY-NNNNNN
  type: RequestType;
  tipLabel: string;
  childId: string;
  elevName: string;
  scoala: string;
  clasa: string;
  parentName: string;
  parentRole: string;
  institutie: string;
  contextLabel?: string;
  documente?: string[];
  detalii?: Record<string, string>;
  createdAt: string; // ISO
  status: "În verificare" | "Aprobată" | "Respinsă" | "Necesită completări";
  auditLog: AuditEntry[];
};

const KEY = "eelev_requests";
const SEQ_KEY = "eelev_request_seq";

function read(): StoredRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as StoredRequest[];
  } catch {
    return [];
  }
}

function write(list: StoredRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("eelev:requests"));
}

export function generateRequestCode(): string {
  const year = new Date().getFullYear();
  let seq = 184;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(SEQ_KEY);
    seq = raw ? parseInt(raw, 10) + 1 : 184;
    window.localStorage.setItem(SEQ_KEY, String(seq));
  }
  return `EE-${year}-${String(seq).padStart(6, "0")}`;
}

export function addRequest(req: StoredRequest) {
  const list = read();
  write([req, ...list]);
}

export function getRequest(id: string): StoredRequest | undefined {
  return read().find((r) => r.id === id);
}

export function useRequests(): StoredRequest[] {
  const [list, setList] = useState<StoredRequest[]>(() => read());
  useEffect(() => {
    const h = () => setList(read());
    window.addEventListener("eelev:requests", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("eelev:requests", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function downloadProof(req: StoredRequest) {
  const html = `<!doctype html>
<html lang="ro"><head><meta charset="utf-8"/>
<title>Dovadă depunere cerere ${req.id}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Inter, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 24px; color: #0f172a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #64748b; font-size: 13px; margin-bottom: 32px; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
  .row:last-child { border-bottom: 0; }
  .row span:first-child { color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: .05em; }
  .row span:last-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .note { margin-top: 24px; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; color: #166534; }
  .foot { margin-top: 32px; color: #94a3b8; font-size: 12px; text-align: center; }
</style></head>
<body>
  <h1>Dovadă depunere cerere</h1>
  <div class="sub">Document generat automat de eElev</div>
  <div class="card">
    <div class="row"><span>Cod cerere</span><span>${req.id}</span></div>
    <div class="row"><span>Tip cerere</span><span>${req.tipLabel}</span></div>
    <div class="row"><span>Solicitant</span><span>${req.parentName}</span></div>
    <div class="row"><span>Elev</span><span>${req.elevName}</span></div>
    <div class="row"><span>Școală / clasă</span><span>${req.scoala} — ${req.clasa}</span></div>
    <div class="row"><span>Instituție destinatară</span><span>${req.institutie}</span></div>
    <div class="row"><span>Data și ora depunerii</span><span>${formatDateTime(req.createdAt)}</span></div>
    <div class="row"><span>Status inițial</span><span>${req.status}</span></div>
    <div class="row"><span>Identitate</span><span>Verificată prin ROeID</span></div>
  </div>
  <div class="note">Dovada depunerii este generată automat de eElev pe baza datelor completate și confirmate electronic. Cererea originală este înregistrată ca date structurate, nu ca formular PDF.</div>
  <div class="foot">eElev · ${formatDateTime(new Date().toISOString())}</div>
</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dovada-${req.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
