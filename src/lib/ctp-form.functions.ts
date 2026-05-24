import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  parinte: z.object({
    numeComplet: z.string(),
    cnpMasked: z.string(),
    email: z.string(),
    rol: z.string(),
  }),
  elev: z.object({
    prenume: z.string(),
    nume: z.string(),
    cnpMasked: z.string().optional(),
    clasa: z.string(),
    scoala: z.string(),
    localitate: z.string(),
  }),
});

export type CtpPrefillInput = z.infer<typeof InputSchema>;

export type CtpPrefilledForm = {
  parinte_nume: string;
  parinte_prenume: string;
  parinte_ci_seria: string;
  parinte_ci_numar: string;
  parinte_cnp: string;
  parinte_judet: string;
  parinte_localitate: string;
  parinte_strada: string;
  parinte_nr: string;
  parinte_bloc: string;
  parinte_scara: string;
  parinte_apartament: string;
  parinte_telefon: string;
  parinte_email: string;
  elev_nume: string;
  elev_prenume: string;
  elev_cnp: string;
  elev_judet: string;
  elev_localitate: string;
  elev_strada: string;
  elev_nr: string;
  elev_bloc: string;
  elev_scara: string;
  elev_apartament: string;
  elev_telefon: string;
  elev_email: string;
  unitate_invatamant: string;
  clasa: string;
  nr_matricol: string;
  localitate_transport: string;
  sursa: "ai" | "fallback";
};

function fallbackPrefill(input: CtpPrefillInput): CtpPrefilledForm {
  const [prenumeP, ...restP] = input.parinte.numeComplet.trim().split(/\s+/);
  const numeP = restP.join(" ") || "—";
  const judet = input.elev.localitate === "Cluj-Napoca" ? "Cluj" : input.elev.localitate;
  const clasaCurat = input.elev.clasa.replace(/^a\s+/, "").replace(/\s*-?a$/, "");
  return {
    parinte_nume: numeP,
    parinte_prenume: prenumeP ?? "—",
    parinte_ci_seria: "CJ",
    parinte_ci_numar: "523847",
    parinte_cnp: input.parinte.cnpMasked,
    parinte_judet: judet,
    parinte_localitate: input.elev.localitate,
    parinte_strada: "Memorandumului",
    parinte_nr: "12",
    parinte_bloc: "—",
    parinte_scara: "—",
    parinte_apartament: "5",
    parinte_telefon: "+40 740 123 456",
    parinte_email: input.parinte.email,
    elev_nume: input.elev.nume,
    elev_prenume: input.elev.prenume,
    elev_cnp: input.elev.cnpMasked ?? "—",
    elev_judet: judet,
    elev_localitate: input.elev.localitate,
    elev_strada: "Memorandumului",
    elev_nr: "12",
    elev_bloc: "—",
    elev_scara: "—",
    elev_apartament: "5",
    elev_telefon: "+40 740 123 456",
    elev_email: input.parinte.email,
    unitate_invatamant: input.elev.scoala,
    clasa: clasaCurat,
    nr_matricol: "2026/IX-17",
    localitate_transport: input.elev.localitate,
    sursa: "fallback",
  };
}

export const prefillCtpForm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<CtpPrefilledForm> => {
    // Demo mockup: return pre-filled form without calling any AI provider.
    return fallbackPrefill(data);
  });
