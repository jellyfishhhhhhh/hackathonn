import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Copy, ShieldCheck, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

const DOCS = [
  "Foaie matricolă",
  "Diplomă Bacalaureat / status Bac",
  "Diplome și certificate",
  "Certificate de voluntariat",
  "Adeverințe",
  "Istoric școlar",
];

type GenerationResult = {
  link: string;
  cod: string;
  expira: string;
};

export function AdmissionDossierDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(DOCS.slice(0, 4));
  const [result, setResult] = useState<GenerationResult | null>(null);

  const toggle = (d: string) =>
    setSelected((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const generate = () => {
    const cod = Math.random().toString(36).slice(2, 8).toUpperCase();
    const id = Math.random().toString(36).slice(2, 10);
    const expira = new Date(Date.now() + 14 * 86400000).toLocaleDateString("ro-RO");
    setResult({
      link: `https://eelev.ro/v/${id}`,
      cod,
      expira,
    });
  };

  const revoke = () => {
    setResult(null);
    toast.success("Accesul a fost revocat.");
  };

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => setResult(null), 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Generează dosar</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Dosar pentru admitere</DialogTitle>
          <DialogDescription>
            Selectează documentele pe care vrei să le incluzi într-un dosar digital verificabil.
            Linkul poate fi protejat cu un cod de acces și poate expira automat.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3 py-2">
            {DOCS.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/30"
              >
                <Checkbox
                  checked={selected.includes(d)}
                  onCheckedChange={() => toggle(d)}
                />
                <span className="text-sm text-foreground">{d}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Card className="space-y-3 border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <ShieldCheck className="h-4 w-4" />
                Dosar generat cu succes
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Link verificabil" value={result.link} icon={LinkIcon} />
                <Row label="Cod de acces" value={result.cod} />
                <Row label="Expiră la" value={result.expira} />
              </div>
            </Card>
            <p className="text-xs text-muted-foreground">
              Trimite linkul și codul instituției destinatare. Poți revoca accesul oricând.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {!result ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
              <Button onClick={generate} disabled={selected.length === 0}>
                Generează dosar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={revoke}>Revocă accesul</Button>
              <Button onClick={() => setOpen(false)}>Închide</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast.success("Copiat în clipboard");
        }}
        className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground hover:text-primary"
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {value}
        <Copy className="h-3 w-3 opacity-60" />
      </button>
    </div>
  );
}
