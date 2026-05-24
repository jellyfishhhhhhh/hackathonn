import { useEffect, useState } from "react";
import { copiiInitiali, type Copil } from "./mock-data";

const KEY = "eelev_children";
const ACTIVE_KEY = "eelev_active_child";
const SCENARIO_KEY = "eelev_lookup_scenario";

export type LookupScenario = "zero" | "one" | "multi";

const copiiMulti: Copil[] = [
  copiiInitiali[0],
  {
    id: "ioana-popescu",
    prenume: "Ioana",
    nume: "Popescu",
    scoala: "Liceul Teoretic Onisifor Ghibu",
    localitate: "Cluj-Napoca",
    clasa: "a V-a",
    status: "confirmat",
    cnpMasked: "6•••••••••••11",
    parinte: "Maria Popescu",
  },
];

export function getLookupChildren(scenario: LookupScenario): Copil[] {
  if (scenario === "zero") return [];
  if (scenario === "multi") return copiiMulti;
  return copiiInitiali;
}

export function getScenario(): LookupScenario {
  if (typeof window === "undefined") return "one";
  return (window.localStorage.getItem(SCENARIO_KEY) as LookupScenario) || "one";
}

export function setScenario(s: LookupScenario) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCENARIO_KEY, s);
}

function read(): Copil[] {
  if (typeof window === "undefined") return copiiInitiali;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Copil[];
  } catch {
    return [];
  }
}

function write(list: Copil[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("eelev:children"));
}

export function setChildrenList(list: Copil[]) {
  write(list);
}

export function getActiveChildId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setActiveChildId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, id);
  window.dispatchEvent(new Event("eelev:active-child"));
}

export function addPendingChild(data: { prenume: string; nume: string; scoala: string; localitate: string; clasa: string }) {
  const list = read();
  const newChild: Copil = {
    id: `pending-${Date.now()}`,
    prenume: data.prenume,
    nume: data.nume,
    scoala: data.scoala,
    localitate: data.localitate,
    clasa: data.clasa,
    status: "in_verificare",
    parinte: "Maria Popescu",
  };
  write([...list, newChild]);
}

export function useChildren(): Copil[] {
  const [list, setList] = useState<Copil[]>(() => read());
  useEffect(() => {
    const handler = () => setList(read());
    window.addEventListener("eelev:children", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("eelev:children", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return list;
}

export function useActiveChildId(): string | null {
  const [id, setId] = useState<string | null>(() => getActiveChildId());
  useEffect(() => {
    const handler = () => setId(getActiveChildId());
    window.addEventListener("eelev:active-child", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("eelev:active-child", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return id;
}

export function getChild(id: string): Copil | undefined {
  return read().find((c) => c.id === id);
}
