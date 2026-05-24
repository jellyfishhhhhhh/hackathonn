import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2, Download, ArrowRight, Home, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { useChildren } from "@/lib/children-store";
import { getUser } from "@/lib/auth";
import {
  addRequest,
  downloadProof,
  formatDateTime,
  generateRequestCode,
  type RequestType,
  type StoredRequest,
} from "@/lib/requests-store";
import { useServerFn } from "@tanstack/react-start";
import { notifySecretariat } from "@/lib/secretariat-notify.functions";

export type { RequestType } from "@/lib/requests-store";

type Props = {
  type: RequestType;
  trigger?: ReactNode;
  contextLabel?: string;
  defaultChildId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};


const CONFIG: Record<
  RequestType,
  { title: string; description: string; institutie: string }
> = {
  adeverinta: {
    title: "Cerere adeverință de elev",
    description:
      "Completează scopul adeverinței. La final confirmi electronic depunerea cu identitate ROeID.",
    institutie: "Secretariatul școlii",
  },
  "scutire-medicala": {
    title: "Scutire medicală",
    description: "Completează detaliile scutirii. La final confirmi electronic depunerea.",
    institutie: "Diriginte",
  },
  invoire: {
    title: "Cerere de învoire",
    description: "Completează intervalul învoirii și motivul. La final confirmi depunerea.",
    institutie: "Diriginte",
  },
  beneficiu: {
    title: "Aplică pentru beneficiu local",
    description: "Confirmă datele și depune cererea către instituția emitentă.",
    institutie: "Autoritate locală — Cluj-Napoca",
  },
  "dosar-admitere": {
    title: "Dosar digital pentru admitere",
    description:
      "Selectează documentele incluse. Instituția primește un link verificabil — toate datele sunt structurate, nu PDF-uri tipărite.",
    institutie: "Instituție de admitere",
  },
};

const TIP_LABEL: Record<RequestType, string> = {
  adeverinta: "Adeverință elev",
  "scutire-medicala": "Scutire medicală",
  invoire: "Învoire / plecare din școală",
  beneficiu: "Beneficiu local",
  "dosar-admitere": "Dosar admitere",
};

const DOCS_ADMITERE = [
  "Foaie matricolă",
  "Diplomă Bacalaureat / status Bac",
  "Diplome și certificate",
  "Certificate de voluntariat",
  "Adeverințe",
  "Istoric școlar",
];

export function DigitalRequestDialog({ type, trigger, contextLabel, defaultChildId, open: openProp, onOpenChange }: Props) {
  const cfg = CONFIG[type];
  const copii = useChildren();
  const user = getUser();
  const parentName = user ? `${user.prenume} ${user.nume}` : "Părinte verificat";
  const parentRole = user?.rol ?? "Părinte / tutore legal";

  const notify = useServerFn(notifySecretariat);
  const [openInternal, setOpenInternal] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = (o: boolean) => {
    if (!isControlled) setOpenInternal(o);
    onOpenChange?.(o);
  };

  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [confirmStage, setConfirmStage] = useState<"review" | "awaiting">("review");
  const [childId, setChildId] = useState<string>(defaultChildId ?? copii[0]?.id ?? "");

  const [scop, setScop] = useState("");
  const [destinatie, setDestinatie] = useState("");
  const [motiv, setMotiv] = useState("");
  const [dataStart, setDataStart] = useState("");
  const [dataEnd, setDataEnd] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [docs, setDocs] = useState<string[]>(DOCS_ADMITERE.slice(0, 4));

  const [acord, setAcord] = useState(false);
  const [submitted, setSubmitted] = useState<StoredRequest | null>(null);

  const selectedChild = copii.find((c) => c.id === childId);

  const tipLabel = useMemo(() => {
    if (type === "beneficiu" && contextLabel) return `${TIP_LABEL.beneficiu} — ${contextLabel}`;
    return TIP_LABEL[type];
  }, [type, contextLabel]);

  const detalii = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (type === "adeverinta") {
      out["Scop"] = scop;
      out["Instituție destinatară"] = destinatie;
    } else if (type === "scutire-medicala") {
      out["De la"] = dataStart;
      out["Până la"] = dataEnd;
      out["Diagnostic"] = diagnostic;
    } else if (type === "invoire") {
      out["De la"] = dataStart;
      out["Până la"] = dataEnd;
      out["Motiv"] = motiv;
    } else if (type === "beneficiu" && motiv) {
      out["Observații"] = motiv;
    }
    return out;
  }, [type, scop, destinatie, dataStart, dataEnd, diagnostic, motiv]);

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setStep("form");
        setConfirmStage("review");
        setScop("");
        setDestinatie("");
        setMotiv("");
        setDataStart("");
        setDataEnd("");
        setDiagnostic("");
        setDocs(DOCS_ADMITERE.slice(0, 4));
        setAcord(false);
        setSubmitted(null);
      }, 200);
    }
  };

  const toggleDoc = (d: string) =>
    setDocs((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const canProceedForm = (() => {
    if (!childId) return false;
    switch (type) {
      case "adeverinta":
        return scop.trim().length > 0 && destinatie.trim().length > 0;
      case "scutire-medicala":
        return !!dataStart && !!dataEnd && diagnostic.trim().length > 0;
      case "invoire":
        return !!dataStart && motiv.trim().length > 0;
      case "beneficiu":
        return true;
      case "dosar-admitere":
        return docs.length > 0;
    }
  })();

  const finalizeApproval = () => {
    if (!selectedChild) return;
    const initiatedAt = new Date(Date.now() - 2600).toISOString();
    const approvedAt = new Date().toISOString();
    const id = generateRequestCode();
    const req: StoredRequest = {
      id,
      type,
      tipLabel,
      childId: selectedChild.id,
      elevName: `${selectedChild.prenume} ${selectedChild.nume}`,
      scoala: selectedChild.scoala,
      clasa: selectedChild.clasa,
      parentName,
      parentRole,
      institutie: cfg.institutie,
      contextLabel,
      documente: type === "dosar-admitere" ? docs : undefined,
      detalii,
      createdAt: approvedAt,
      status: "În verificare",
      auditLog: [
        { at: initiatedAt, actor: parentName, action: "Cerere inițiată din eElev", method: "ROeID" },
        { at: approvedAt, actor: parentName, action: "Cerere confirmată electronic", method: "Confirmare electronică" },
      ],
    };
    addRequest(req);
    setSubmitted(req);
    setStep("done");
    setConfirmStage("review");
    toast.success("Cererea a fost trimisă.");

    // Notifică secretariat pentru cereri importante.
    const isVoucher700 =
      type === "beneficiu" &&
      !!contextLabel &&
      /voucher\s+(cultural|sportiv)/i.test(contextLabel);
    const shouldNotify = isVoucher700 || type === "scutire-medicala" || type === "invoire";
    if (shouldNotify) {
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
        toast.warning("Cererea a fost salvată, dar notificarea email nu a putut fi trimisă.");
      });
    }

  };

  useEffect(() => {
    if (step !== "confirm" || confirmStage !== "awaiting") return;
    const t = setTimeout(finalizeApproval, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, confirmStage]);

  return (
    <Dialog open={open} onOpenChange={reset}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{cfg.title}</DialogTitle>
              <DialogDescription>
                {contextLabel ? (
                  <span className="font-medium text-foreground">{contextLabel}. </span>
                ) : null}
                {cfg.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              {copii.length > 0 && (
                <Field label="Elev">
                  <Select value={childId} onValueChange={setChildId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează elevul" />
                    </SelectTrigger>
                    <SelectContent>
                      {copii.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.prenume} {c.nume} — {c.clasa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {type === "adeverinta" && (
                <>
                  <Field label="Scopul adeverinței">
                    <Input
                      value={scop}
                      onChange={(e) => setScop(e.target.value)}
                      placeholder="ex: medic de familie, bibliotecă, transport"
                    />
                  </Field>
                  <Field label="Instituția destinatară">
                    <Input
                      value={destinatie}
                      onChange={(e) => setDestinatie(e.target.value)}
                      placeholder="ex: Cabinet Dr. Ionescu"
                    />
                  </Field>
                </>
              )}

              {type === "scutire-medicala" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="De la">
                      <Input type="date" value={dataStart} onChange={(e) => setDataStart(e.target.value)} />
                    </Field>
                    <Field label="Până la">
                      <Input type="date" value={dataEnd} onChange={(e) => setDataEnd(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Diagnostic / motiv medical">
                    <Textarea
                      value={diagnostic}
                      onChange={(e) => setDiagnostic(e.target.value)}
                      placeholder="ex: viroză respiratorie acută"
                      rows={3}
                    />
                  </Field>
                </>
              )}

              {type === "invoire" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="De la">
                      <Input type="datetime-local" value={dataStart} onChange={(e) => setDataStart(e.target.value)} />
                    </Field>
                    <Field label="Până la">
                      <Input type="datetime-local" value={dataEnd} onChange={(e) => setDataEnd(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Motivul învoirii">
                    <Textarea
                      value={motiv}
                      onChange={(e) => setMotiv(e.target.value)}
                      placeholder="ex: control medical programat"
                      rows={3}
                    />
                  </Field>
                </>
              )}

              {type === "beneficiu" && (
                <Card className="space-y-2 border-border bg-muted/40 p-4 text-sm">
                  <p className="font-medium text-foreground">Date trimise instituției</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Nume, prenume și CNP elev (criptat)</li>
                    <li>• Școala și clasa curentă</li>
                    <li>• Localitatea de domiciliu</li>
                    <li>• Statusul de eligibilitate verificat de eElev</li>
                  </ul>
                  <Field label="Observații (opțional)">
                    <Textarea
                      value={motiv}
                      onChange={(e) => setMotiv(e.target.value)}
                      rows={2}
                      placeholder="Lasă gol dacă nu este cazul"
                    />
                  </Field>
                </Card>
              )}

              {type === "dosar-admitere" && (
                <div className="space-y-2">
                  <Label className="text-sm">Documente incluse</Label>
                  {DOCS_ADMITERE.map((d) => (
                    <label
                      key={d}
                      className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/30"
                    >
                      <Checkbox checked={docs.includes(d)} onCheckedChange={() => toggleDoc(d)} />
                      <span className="text-sm text-foreground">{d}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => reset(false)}>
                Anulează
              </Button>
              <Button onClick={() => setStep("confirm")} disabled={!canProceedForm}>
                Continuă la confirmare
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirm" && confirmStage === "review" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Confirmare cerere</DialogTitle>
              <DialogDescription>
                Verifică datele și confirmă depunerea cererii.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <Card className="space-y-2 border-border p-3.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rezumat cerere
                </p>
                <SummaryRow label="Tip cerere" value={tipLabel} />
                {selectedChild && (
                  <>
                    <SummaryRow label="Elev" value={`${selectedChild.prenume} ${selectedChild.nume}`} />
                    <SummaryRow label="Școală" value={selectedChild.scoala} />
                    <SummaryRow label="Clasă" value={selectedChild.clasa} />
                  </>
                )}
                <SummaryRow label="Solicitant" value={parentName} />
                <SummaryRow label="Instituție destinatară" value={cfg.institutie} />
                {type === "dosar-admitere" && (
                  <SummaryRow label="Documente" value={`${docs.length} documente atașate`} />
                )}
                {Object.entries(detalii)
                  .filter(([, v]) => v && v.trim().length > 0)
                  .map(([k, v]) => (
                    <SummaryRow key={k} label={k} value={v} />
                  ))}
                <SummaryRow
                  label="Data completării"
                  value={new Date().toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                />
              </Card>

              <Card className="space-y-2 border-success/20 bg-success/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium text-foreground">Identitate ROeID</span>
                  </div>
                  <Badge className="bg-success/15 text-success hover:bg-success/15">
                    Verificat
                  </Badge>
                </div>
                <div className="space-y-1 text-sm">
                  <SummaryRow label="Solicitant" value={parentName} compact />
                  <SummaryRow label="Rol" value={parentRole} compact />
                  <SummaryRow label="Metodă" value="ROeID" compact />
                </div>
              </Card>

              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3.5">
                <p className="text-sm text-foreground">
                  Confirm că datele introduse sunt corecte și că am dreptul legal de a depune
                  această cerere pentru elevul selectat. Înțeleg că cererea va fi transmisă
                  electronic către instituția responsabilă și va fi înregistrată în platformă.
                </p>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={acord}
                    onCheckedChange={(v) => setAcord(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Am citit și confirm depunerea cererii în calitate de părinte/tutore legal.
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setStep("form")}>
                Înapoi la editare
              </Button>
              <Button onClick={() => setConfirmStage("awaiting")} disabled={!acord}>
                Trimite cererea
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "confirm" && confirmStage === "awaiting" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Se trimite cererea
              </DialogTitle>
              <DialogDescription>
                Cererea este confirmată electronic și înregistrată în platformă.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="relative mx-auto mt-2 flex h-28 w-28 items-center justify-center">
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute h-16 w-16 rounded-full bg-primary/20 [transform-origin:center] [will-change:transform,opacity]"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.75, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute h-16 w-16 rounded-full bg-primary/20 [transform-origin:center] [will-change:transform,opacity]"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.75, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
                />
                <div className="relative grid h-16 w-16 place-content-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Smartphone className="h-7 w-7" />
                </div>
              </div>

              <Card className="space-y-1.5 border-border p-3.5 text-sm">
                <SummaryRow label="Tip cerere" value={tipLabel} compact />
                {selectedChild && (
                  <SummaryRow
                    label="Elev"
                    value={`${selectedChild.prenume} ${selectedChild.nume}`}
                    compact
                  />
                )}
                <SummaryRow label="Solicitant" value={parentName} compact />
                <SummaryRow label="Instituție" value={cfg.institutie} compact />
              </Card>

              <p className="text-center text-xs text-muted-foreground">
                Se înregistrează cererea…
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setConfirmStage("review")}>
                <X className="mr-1.5 h-4 w-4" /> Anulează
              </Button>
              <Button disabled>Se înregistrează cererea…</Button>
            </DialogFooter>
          </>
        )}



        {step === "done" && submitted && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Cerere depusă electronic</DialogTitle>
              <DialogDescription>
                Cererea a fost înregistrată și trimisă către instituția responsabilă.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <Card className="space-y-2 border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Înregistrare confirmată
                </div>
                <div className="space-y-1.5 text-sm">
                  <SummaryRow label="Cod cerere" value={submitted.id} mono />
                  <SummaryRow label="Data și ora depunerii" value={formatDateTime(submitted.createdAt)} />
                  <SummaryRow label="Solicitant" value={submitted.parentName} />
                  <SummaryRow label="Identitate" value="Verificată prin ROeID" />
                  <SummaryRow label="Status" value={submitted.status} />
                  <SummaryRow label="Instituție" value={submitted.institutie} />
                </div>
              </Card>

              <p className="text-xs text-muted-foreground">
                Vei primi notificări atunci când cererea este verificată, aprobată sau dacă sunt
                necesare completări.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
              <Button variant="outline" onClick={() => downloadProof(submitted)}>
                <Download className="mr-1.5 h-4 w-4" /> Descarcă dovada
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/cereri/$id" params={{ id: submitted.id }} onClick={() => reset(false)}>
                  Vezi status cerere <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard" onClick={() => reset(false)}>
                  <Home className="mr-1.5 h-4 w-4" /> Înapoi la dashboard
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  compact,
}: {
  label: string;
  value: string;
  mono?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-3 ${compact ? "" : "py-0.5"}`}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-right text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
