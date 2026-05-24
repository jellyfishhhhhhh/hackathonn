import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Link as LinkIcon, ShieldCheck, ShieldOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  SHARE_SECTIONS,
  DEFAULT_SECTIONS,
  createShare,
  revokeShare,
  formatShareDate,
  type ShareSectionId,
  type SharedLink,
} from "@/lib/shares-store";

type Step = 1 | 2 | 3 | 4;

export function ShareDossierDialog({
  childId,
  trigger,
}: {
  childId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [sections, setSections] = useState<ShareSectionId[]>(DEFAULT_SECTIONS);
  const [validity, setValidity] = useState<7 | 14 | 30>(14);
  const [requireCode, setRequireCode] = useState(true);
  const [allowDownload, setAllowDownload] = useState(false);
  const [verificationOnly, setVerificationOnly] = useState(true);
  const [result, setResult] = useState<SharedLink | null>(null);

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setStep(1);
        setSections(DEFAULT_SECTIONS);
        setValidity(14);
        setRequireCode(true);
        setAllowDownload(false);
        setVerificationOnly(true);
        setResult(null);
      }, 200);
    }
  };

  const toggleSection = (id: ShareSectionId) =>
    setSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const generate = () => {
    const link = createShare({
      childId,
      sections,
      validityDays: validity,
      requireCode,
      allowDownload,
      verificationOnly,
    });
    setResult(link);
    setStep(4);
  };

  const doRevoke = () => {
    if (!result) return;
    revokeShare(result.id);
    setResult({
      ...result,
      status: "Revocat",
    });
    toast.success("Accesul a fost revocat.");
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copiat în clipboard`);
  };

  const selectedSections = SHARE_SECTIONS.filter((s) => sections.includes(s.id));
  const publicLink = result ? `https://e-elev.online/verificare/${result.id}` : "";
  const revoked = result?.status === "Revocat";

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {step === 4 ? "Link generat" : "Partajează dosarul eElev"}
          </DialogTitle>
          {step !== 4 && (
            <DialogDescription>
              Selectează informațiile care pot fi accesate printr-un link securizat.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ce dorești să partajezi?
            </p>
            {SHARE_SECTIONS.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/30"
              >
                <Checkbox
                  className="mt-0.5"
                  checked={sections.includes(s.id)}
                  onCheckedChange={() => toggleSection(s.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.descriere}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Valabilitate link
              </p>
              <RadioGroup
                value={String(validity)}
                onValueChange={(v) => setValidity(Number(v) as 7 | 14 | 30)}
                className="flex flex-wrap gap-2"
              >
                {[7, 14, 30].map((d) => (
                  <Label
                    key={d}
                    htmlFor={`val-${d}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id={`val-${d}`} value={String(d)} />
                    {d} zile
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <SettingToggle
              checked={requireCode}
              onChange={setRequireCode}
              title="Protejează linkul cu un cod de acces"
              description="Persoana care primește linkul trebuie să introducă și codul de acces pentru a vedea informațiile partajate."
            />
            <SettingToggle
              checked={allowDownload}
              onChange={setAllowDownload}
              title="Permite descărcarea documentelor"
              description="Instituția poate descărca documentele partajate."
            />
            <SettingToggle
              checked={verificationOnly}
              onChange={setVerificationOnly}
              title="Afișează doar statusul de verificare"
              description="Instituția va vedea doar informațiile selectate de tine."
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <Card className="space-y-3 border-border p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vei partaja
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {selectedSections.map((s) => (
                    <li key={s.id} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
              <SummaryRow label="Acces valabil" value={`${validity} zile`} />
              <SummaryRow
                label="Protecție"
                value={requireCode ? "Link + cod de acces" : "Doar link"}
              />
              <SummaryRow
                label="Descărcare"
                value={allowDownload ? "Permisă" : "Doar vizualizare"}
              />
            </Card>
            <p className="text-xs text-muted-foreground">
              Persoanele care primesc linkul pot vedea doar informațiile selectate și doar pe
              perioada stabilită.
            </p>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-4 py-2">
            <Card
              className={`space-y-3 p-4 ${
                revoked
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-success/20 bg-success/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {revoked ? (
                    <>
                      <ShieldOff className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Acces revocat</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span className="text-success">Link activ</span>
                    </>
                  )}
                </div>
                <Badge variant={revoked ? "destructive" : "secondary"}>{result.status}</Badge>
              </div>
              <ResultRow
                label="Link verificabil"
                value={publicLink}
                icon={LinkIcon}
                href={revoked ? undefined : publicLink}
                onCopy={revoked ? undefined : () => copy(publicLink, "Linkul")}
              />
              <ResultRow
                label="Cod de acces"
                value={result.accessCode}
                icon={KeyRound}
                onCopy={revoked ? undefined : () => copy(result.accessCode, "Codul")}
              />
              <SummaryRow label="Valabil până la" value={formatShareDate(result.expiresAt)} />
            </Card>
            {revoked ? (
              <p className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                Accesul la acest link a fost revocat.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Linkul permite acces doar la informațiile selectate. Accesul poate fi revocat
                oricând.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={() => reset(false)}>
                Anulează
              </Button>
              <Button onClick={() => setStep(2)} disabled={sections.length === 0}>
                Continuă
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Înapoi
              </Button>
              <Button onClick={() => setStep(3)}>Continuă</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>
                Înapoi
              </Button>
              <Button onClick={generate}>Generează link</Button>
            </>
          )}
          {step === 4 && (
            <>
              {!revoked && (
                <Button variant="outline" onClick={doRevoke}>
                  Revocă accesul
                </Button>
              )}
              <Button onClick={() => reset(false)}>Închide</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingToggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function ResultRow({
  label,
  value,
  icon: Icon,
  onCopy,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  onCopy?: () => void;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-sm text-foreground transition-colors hover:text-primary"
          >
            {Icon && <Icon className="h-3.5 w-3.5 flex-none" />}
            <span className="truncate">{value}</span>
          </a>
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-mono text-sm text-foreground">
            {Icon && <Icon className="h-3.5 w-3.5 flex-none" />}
            <span className="truncate">{value}</span>
          </span>
        )}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="flex-none text-muted-foreground transition-colors hover:text-primary"
            aria-label="Copiază"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

