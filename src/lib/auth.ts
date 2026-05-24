// Mock auth backed by localStorage. No real backend.
export type MockUser = {
  nume: string;
  prenume: string;
  cnp: string;
  email: string;
  rol: string;
  tip: "parinte" | "elev" | "secretariat";
};

const KEY = "mec_mock_auth_user";

export const mockUser: MockUser = {
  nume: "Popescu",
  prenume: "Maria",
  cnp: "2•••••••••••87",
  email: "maria.popescu@exemplu.ro",
  rol: "Părinte / Tutore legal",
  tip: "parinte",
};

export const mockUserSecretariat: MockUser = {
  nume: "Ionescu",
  prenume: "Andrei",
  cnp: "1•••••••••••42",
  email: "andrei.ionescu@scoala.ro",
  rol: "Secretariat / Profesor",
  tip: "secretariat",
};

export function getUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as MockUser) : null;
}

export function login(tip: "parinte" | "secretariat" = "parinte") {
  if (typeof window === "undefined") return;
  const user = tip === "secretariat" ? mockUserSecretariat : mockUser;
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  // Clear recent requests on logout
  window.localStorage.removeItem("eelev_requests");
  window.localStorage.removeItem("eelev_request_seq");
  window.dispatchEvent(new Event("eelev:requests"));
  // Clear shared links on logout
  window.localStorage.removeItem("eelev_shares");
  window.localStorage.removeItem("eelev_shares_seq");
  window.dispatchEvent(new Event("eelev:shares"));
}
