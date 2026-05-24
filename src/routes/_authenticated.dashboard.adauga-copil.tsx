import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Upload, FileCheck2 } from "lucide-react";

const LOCALITATI = [
  "Cluj-Napoca",
  "București",
  "Timișoara",
  "Iași",
  "Constanța",
  "Brașov",
  "Sibiu",
  "Oradea",
  "Craiova",
  "Galați",
];

const SCOLI_BY_LOCALITATE: Record<string, string[]> = {
  "Cluj-Napoca": [
    "Liceul Teoretic Onisifor Ghibu",
    "Colegiul Național Emil Racoviță",
    "Liceul Teoretic Avram Iancu",
    "Școala Gimnazială Ion Agârbiceanu",
  ],
  "București": [
    "Colegiul Național Sfântul Sava",
    "Colegiul Național Gheorghe Lazăr",
    "Liceul Teoretic Jean Monnet",
    "Școala Gimnazială nr. 195",
  ],
  "Timișoara": [
    "Colegiul Național Bănățean",
    "Liceul Teoretic Nikolaus Lenau",
    "Școala Gimnazială nr. 7 Sfânta Maria",
  ],
  "Iași": [
    "Colegiul Național Iași",
    "Liceul Teoretic Garabet Ibrăileanu",
    "Școala Gimnazială Alexandru cel Bun",
  ],
  "Constanța": [
    "Colegiul Național Mircea cel Bătrân",
    "Liceul Teoretic Ovidius",
    "Școala Gimnazială nr. 30 Gheorghe Țițeica",
  ],
  "Brașov": [
    "Colegiul Național Andrei Șaguna",
    "Liceul Teoretic Johannes Honterus",
  ],
  "Sibiu": [
    "Colegiul Național Samuel von Brukenthal",
    "Liceul Teoretic Onisifor Ghibu Sibiu",
  ],
  "Oradea": [
    "Colegiul Național Emanuil Gojdu",
    "Liceul Teoretic Aurel Lazăr",
  ],
  "Craiova": [
    "Colegiul Național Carol I",
    "Liceul Teoretic Tudor Arghezi",
  ],
  "Galați": [
    "Colegiul Național Vasile Alecsandri",
    "Liceul Teoretic Emil Racoviță",
  ],
};

const CLASE = [
  "Pregătitoare",
  "a I-a",
  "a II-a",
  "a III-a",
  "a IV-a",
  "a V-a",
  "a VI-a",
  "a VII-a",
  "a VIII-a",
  "a IX-a",
  "a X-a",
  "a XI-a",
  "a XII-a",
];
import { addPendingChild } from "@/lib/children-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/adauga-copil")({
  head: () => ({ meta: [{ title: "Adaugă copil — eElev" }] }),
  component: AdaugaCopil,
});

type FormState = {
  nume: string;
  prenume: string;
  cnp: string;
  dataNasterii: string;
  scoala: string;
  clasa: string;
  localitate: string;
  metoda: "registre" | "document";
  acord: boolean;
};

const steps = ["Date copil", "Verificare relație", "Confirmare școală", "Finalizare"];

function AdaugaCopil() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    nume: "",
    prenume: "",
    cnp: "",
    dataNasterii: "",
    scoala: "",
    clasa: "",
    localitate: "",
    metoda: "registre",
    acord: false,
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) {
      return form.nume.trim() && form.prenume.trim() && /^\d{13}$/.test(form.cnp) && form.dataNasterii && form.scoala.trim() && form.clasa.trim() && form.localitate.trim();
    }
    if (step === 2) return form.acord;
    return true;
  };

  const next = () => {
    if (step === 2) {
      addPendingChild({
        prenume: form.prenume.trim(),
        nume: form.nume.trim(),
        scoala: form.scoala.trim(),
        localitate: form.localitate.trim(),
        clasa: form.clasa.trim(),
      });
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Înapoi la panou
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Adaugă copil
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Asocierea se face automat dacă școala are deja CNP-ul tău în dosarul copilului.
          Folosește acest formular doar dacă elevul tău nu apare în listă.
        </p>
      </div>

      {/* Stepper */}
      <ol className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li
              key={s}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                state === "done"
                  ? "border-success/30 bg-success/10 text-success"
                  : state === "current"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/70 text-[10px]">
                {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </li>
          );
        })}
      </ol>

      <Card className="border-border p-6 shadow-soft">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nume copil"><Input value={form.nume} onChange={(e) => update("nume", e.target.value)} placeholder="Popescu" /></Field>
                  <Field label="Prenume copil"><Input value={form.prenume} onChange={(e) => update("prenume", e.target.value)} placeholder="Andrei" /></Field>
                  <Field label="CNP copil"><Input value={form.cnp} onChange={(e) => update("cnp", e.target.value.replace(/\D/g, "").slice(0, 13))} placeholder="13 cifre" inputMode="numeric" /></Field>
                  <Field label="Data nașterii"><Input type="date" value={form.dataNasterii} onChange={(e) => update("dataNasterii", e.target.value)} /></Field>
                  <Field label="Școala">
                    <Select
                      value={form.scoala}
                      onValueChange={(v) => update("scoala", v)}
                      disabled={!form.localitate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={form.localitate ? "Alege școala" : "Alege întâi localitatea"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(SCOLI_BY_LOCALITATE[form.localitate] ?? []).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Clasa">
                    <Select value={form.clasa} onValueChange={(v) => update("clasa", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege clasa" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASE.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Localitatea">
                    <Select
                      value={form.localitate}
                      onValueChange={(v) => {
                        update("localitate", v);
                        update("scoala", "");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alege localitatea" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCALITATI.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground">
                  Datele sunt folosite exclusiv pentru verificarea relației legale părinte-copil.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Alege modalitatea de verificare a relației legale:
                </p>
                <RadioGroup value={form.metoda} onValueChange={(v) => update("metoda", v as FormState["metoda"])} className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-accent/30">
                    <RadioGroupItem value="registre" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Verificare automată prin registre oficiale
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Folosim ROeID și registrele de stare civilă pentru a confirma instant relația de rudenie.
                      </p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-accent/30">
                    <RadioGroupItem value="document" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Upload className="h-4 w-4 text-primary" />
                        Încărcare document justificativ
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Documente acceptate: certificat de naștere, document tutelă / reprezentare legală, hotărâre judecătorească (dacă este cazul).
                      </p>
                      {form.metoda === "document" && (
                        <Input type="file" className="mt-2" accept=".pdf,.jpg,.jpeg,.png" />
                      )}
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4">
                  <FileCheck2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Confirmare școală</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Cererea de asociere va fi trimisă către secretariatul școlii pentru confirmarea înscrierii elevului.
                    </p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
                  <Checkbox checked={form.acord} onCheckedChange={(v) => update("acord", v === true)} className="mt-0.5" />
                  Sunt de acord cu transmiterea datelor către secretariatul instituției și înțeleg că datele elevului vor fi afișate doar după verificare.
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-foreground">Cerere trimisă spre verificare</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vei primi o notificare imediat ce secretariatul confirmă asocierea. Datele elevului vor apărea automat în panou.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between gap-3 border-t border-border pt-5">
          {step < steps.length - 1 ? (
            <>
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
              </Button>
              <Button disabled={!canNext()} onClick={next}>
                {step === 2 ? "Trimite cererea" : "Continuă"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              className="mx-auto"
              onClick={() => {
                toast.success("Cererea a fost înregistrată.");
                navigate({ to: "/dashboard" });
              }}
            >
              Înapoi la panou
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
