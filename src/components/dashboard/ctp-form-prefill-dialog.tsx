import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Loader2, CheckCircle2, Download, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { useChildren } from "@/lib/children-store";
import { getUser } from "@/lib/auth";
import {
  prefillCtpForm,
  type CtpPrefilledForm,
} from "@/lib/ctp-form.functions";
import { notifySecretariat } from "@/lib/secretariat-notify.functions";
import {
  addRequest,
  downloadProof,
  generateRequestCode,
  type StoredRequest,
} from "@/lib/requests-store";

type Props = {
  trigger: ReactNode;
  defaultChildId?: string;
};

type Step = "loading" | "review" | "submitting" | "done";

export function CtpFormPrefillDialog({ trigger, defaultChildId }: Props) {
  const copii = useChildren();
  const user = getUser();
  const parentName = user ? `${user.prenume} ${user.nume}` : "Părinte verificat";
  const parentRole = user?.rol ?? "Părinte / tutore legal";
  const child = copii.find((c) => c.id === defaultChildId) ?? copii[0];

  const prefill = useServerFn(prefillCtpForm);
  const notify = useServerFn(notifySecretariat);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("loading");
  const [form, setForm] = useState<CtpPrefilledForm | null>(null);
  const [acord, setAcord] = useState(false);
  const [submitted, setSubmitted] = useState<StoredRequest | null>(null);

  useEffect(() => {
    if (!open || !child || form) return;
    setStep("loading");
    prefill({
      data: {
        parinte: {
          numeComplet: parentName,
          cnpMasked: user?.cnp ?? "—",
          email: user?.email ?? "—",
          rol: parentRole,
        },
        elev: {
          prenume: child.prenume,
          nume: child.nume,
          cnpMasked: child.cnpMasked,
          clasa: child.clasa,
          scoala: child.scoala,
          localitate: child.localitate,
        },
      },
    })
      .then((res) => {
        setForm(res);
        setStep("review");
      })
      .catch((e) => {
        console.error(e);
        toast.error("Nu s-a putut completa cererea. Încearcă din nou.");
        setOpen(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, child?.id]);

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setStep("loading");
        setForm(null);
        setAcord(false);
        setSubmitted(null);
      }, 200);
    }
  };

  const submit = () => {
    if (!form || !child) return;
    setStep("submitting");
    const initiatedAt = new Date(Date.now() - 2600).toISOString();
    setTimeout(() => {
      const approvedAt = new Date().toISOString();
      const id = generateRequestCode();
      const req: StoredRequest = {
        id,
        type: "beneficiu",
        tipLabel: "Beneficiu local — Decont transport CTP Cluj-Napoca",
        childId: child.id,
        elevName: `${child.prenume} ${child.nume}`,
        scoala: child.scoala,
        clasa: child.clasa,
        parentName,
        parentRole,
        institutie: "CTP Cluj-Napoca",
        contextLabel: "Abonament transport public gratuit pentru elevi",
        detalii: {
          "Localitate transport": form.localitate_transport,
          "Unitate de învățământ": form.unitate_invatamant,
          "Clasa": form.clasa,
          "Nr. matricol": form.nr_matricol,
          "Completare": form.sursa === "ai" ? "AI din ROeID" : "Offline din ROeID",
        },
        createdAt: approvedAt,
        status: "În verificare",
        auditLog: [
          { at: initiatedAt, actor: parentName, action: "Cerere pre-completată automat cu AI din datele ROeID", method: "ROeID + AI" },
          { at: approvedAt, actor: parentName, action: "Identitate confirmată prin autentificare ROeID și cerere trimisă către CTP Cluj-Napoca", method: "Autentificare ROeID" },
        ],
      };
      addRequest(req);
      setSubmitted(req);
      setStep("done");
      toast.success("Cererea CTP a fost trimisă.");
      notify({
        data: {
          requestId: req.id,
          tipLabel: req.tipLabel,
          elevName: req.elevName,
          clasa: req.clasa,
          scoala: req.scoala,
          parentName: req.parentName,
          parentRole: req.parentRole,
          institutie: req.institutie,
          contextLabel: req.contextLabel,
          detalii: req.detalii,
          documente: req.documente,
          createdAt: req.createdAt,
        },
      }).catch((e) => {
        console.error("notifySecretariat failed", e);
        toast.warning("Cererea a fost salvată, dar notificarea către secretariat nu a putut fi trimisă.");
      });
    }, 2400);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-serif text-xl">Se completează automat cererea CTP</p>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-ul mapează datele tale ROeID în formularul oficial CTP Cluj-Napoca…
              </p>
            </div>
          </div>
        )}

        {step === "review" && form && child && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Cerere abonament transport — CTP Cluj-Napoca
              </DialogTitle>
              <DialogDescription>
                Formularul oficial, pre-completat din datele tale ROeID. Verifică și semnează electronic.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-3.5">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    Completat automat cu AI din ROeID
                    {form.sursa === "fallback" && (
                      <Badge variant="outline" className="ml-2 text-xs">offline</Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    Nu mai e nevoie să scrii nimic — toate datele sunt deja preluate. Verifică-le și confirmă.
                  </p>
                </div>
              </div>

              <Card className="space-y-4 border-border p-5 text-sm leading-relaxed">
                <div className="border-b border-border pb-3">
                  <p className="text-center font-serif text-base font-semibold underline">
                    CERERE — Abonament transport public gratuit pentru ELEVI
                  </p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    privind emiterea Cardului de transport și abonamentului gratuit conform Legii învățământului preuniversitar nr. 198/2023
                  </p>
                </div>

                <p>
                  Subsemnatul <strong>PĂRINTE / TUTORE</strong> (nume și prenume){" "}
                  <F v={`${form.parinte_nume} ${form.parinte_prenume}`} />, posesor al C.I.
                  seria <F v={form.parinte_ci_seria} /> nr. <F v={form.parinte_ci_numar} /> CNP{" "}
                  <F v={form.parinte_cnp} mono />, domiciliat în județul <F v={form.parinte_judet} /> localitatea{" "}
                  <F v={form.parinte_localitate} />, str. <F v={form.parinte_strada} /> nr. <F v={form.parinte_nr} />{" "}
                  bl. <F v={form.parinte_bloc} /> sc. <F v={form.parinte_scara} /> ap. <F v={form.parinte_apartament} />{" "}
                  telefon <F v={form.parinte_telefon} /> e-mail <F v={form.parinte_email} />, cunoscând că falsul în
                  declarații este pedepsit de legea penală, solicit eliberarea unui card și/sau abonament gratuit
                  pentru elevi, pentru:
                </p>

                <div className="rounded-md bg-muted/40 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ELEVUL/A
                  </p>
                  <p>
                    <strong>Nume</strong> <F v={form.elev_nume} /> <strong>Prenume</strong>{" "}
                    <F v={form.elev_prenume} />
                  </p>
                  <p className="mt-2">
                    <strong>CNP elev</strong> <F v={form.elev_cnp} mono /> — domiciliu elev: județul{" "}
                    <F v={form.elev_judet} /> localitatea <F v={form.elev_localitate} />, str.{" "}
                    <F v={form.elev_strada} /> nr. <F v={form.elev_nr} /> bl. <F v={form.elev_bloc} /> sc.{" "}
                    <F v={form.elev_scara} /> ap. <F v={form.elev_apartament} />, telefon{" "}
                    <F v={form.elev_telefon} /> e-mail <F v={form.elev_email} />
                  </p>
                  <p className="mt-2">
                    <strong>Înmatriculat la Unitatea de Învățământ</strong>{" "}
                    <F v={form.unitate_invatamant} /> în clasa a <F v={form.clasa} />-a{" "}
                    <strong>nr. matricol</strong> <F v={form.nr_matricol} />
                  </p>
                  <p className="mt-2">
                    care se deplasează cu Transportul Public din <strong>LOCALITATEA</strong>:{" "}
                    <F v={form.localitate_transport} />
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Subsemnatul declar că sunt informat referitor la prelucrarea datelor cu caracter personal
                  de către CTP Cluj-Napoca și sunt de acord ca datele personale ale elevului (nume,
                  prenume, CNP, adresă, fotografie, date referitoare la titlurile de călătorie) să fie
                  prelucrate conform legislației în vigoare. Informațiile pot fi consultate online pe site-ul
                  www.ctpcj.ro, secțiunea DESPRE NOI / PRELUCRARE DATE PERSONALE.
                </p>

                <div className="mt-2 grid grid-cols-1 gap-3 border-t border-dashed border-border pt-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Data</p>
                    <F v={new Date().toLocaleDateString("ro-RO")} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      În loc de semnătură
                    </p>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs font-medium">
                      <Fingerprint className="h-3.5 w-3.5 text-primary" />
                      Autentificare ROeID necesară
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-2 border-success/20 bg-success/5 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">Identitate ROeID — {parentName}</span>
                  </div>
                  <Badge className="bg-success/15 text-success hover:bg-success/15">Verificat</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Documentul nu necesită semnătură olografă. La trimitere vei confirma identitatea
                  printr-o autentificare ROeID, echivalentă legal cu semnătura.
                </p>
              </Card>

              <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/30 p-3.5 text-sm">
                <Checkbox
                  checked={acord}
                  onCheckedChange={(v) => setAcord(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Confirm că datele de mai sus sunt corecte și sunt de acord cu prelucrarea datelor
                  personale ale elevului de către CTP Cluj-Napoca, conform GDPR.
                </span>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => reset(false)}>
                Anulează
              </Button>
              <Button onClick={submit} disabled={!acord}>
                <Fingerprint className="mr-2 h-4 w-4" />
                Autentifică cu ROeID și trimite
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "submitting" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <Fingerprint className="absolute -right-2 -top-2 h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-serif text-xl">Autentificare ROeID în curs</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Confirmăm identitatea ta și transmitem cererea către CTP Cluj-Napoca…
              </p>
            </div>
          </div>
        )}

        {step === "done" && submitted && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
                <CheckCircle2 className="h-6 w-6 text-success" />
                Cerere trimisă
              </DialogTitle>
              <DialogDescription>
                Cererea ta a fost înregistrată la CTP Cluj-Napoca.
              </DialogDescription>
            </DialogHeader>
            <Card className="space-y-2 border-border p-4 text-sm">
              <Row k="Cod cerere" v={submitted.id} mono />
              <Row k="Instituție" v={submitted.institutie} />
              <Row k="Elev" v={submitted.elevName} />
              <Row k="Status" v={submitted.status} />
            </Card>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => downloadProof(submitted)}>
                <Download className="mr-2 h-4 w-4" />
                Descarcă dovada
              </Button>
              <Button onClick={() => reset(false)}>Închide</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function F({ v, mono }: { v: string; mono?: boolean }) {
  return (
    <span
      className={`inline-block rounded bg-primary/10 px-1.5 py-0.5 text-foreground ${
        mono ? "font-mono text-[0.85em]" : "font-medium"
      }`}
    >
      {v || "—"}
    </span>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-border pb-1.5 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{v}</span>
    </div>
  );
}
