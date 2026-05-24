import { useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  X,
  ShieldCheck,
  ClipboardList,
  Paperclip,
  History,
  Info,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { inboxSecretariat, cereriDetalii, type DocStare } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/secretariat/cerere/$id")({
  head: () => ({ meta: [{ title: "Detalii cerere — Secretariat" }] }),
  component: CerereDetaliu,
});

const COMPLETARI_OPTIUNI = [
  "IBAN lipsă",
  "Document justificativ lipsă",
  "Perioadă incompletă",
  "Motiv neclar",
];

function CerereDetaliu() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const cerere = inboxSecretariat.find((c) => c.id === id);
  const detalii = cereriDetalii[id];

  const [completariOpen, setCompletariOpen] = useState(false);
  const [bifate, setBifate] = useState<string[]>([]);
  const [altaCompletare, setAltaCompletare] = useState("");

  if (!cerere || !detalii) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Cererea nu a fost găsită.</p>
        <Button asChild variant="outline">
          <Link to="/secretariat">Înapoi la inbox</Link>
        </Button>
      </div>
    );
  }

  const action = (msg: string) => {
    toast.success(msg);
    navigate({ to: "/secretariat" });
  };

  const trimiteCompletari = () => {
    const lista = [...bifate, ...(altaCompletare.trim() ? [altaCompletare.trim()] : [])];
    if (lista.length === 0) {
      toast.error("Selectează cel puțin un element de completat.");
      return;
    }
    setCompletariOpen(false);
    toast.success("Cererea a fost trimisă părintelui pentru completări.", {
      description: lista.join(" · "),
    });
    setTimeout(() => navigate({ to: "/secretariat" }), 600);
  };

  const toggle = (v: string) =>
    setBifate((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className="space-y-6">
      <Link
        to="/secretariat"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Înapoi la inbox
      </Link>

      <header className="space-y-3">
        <h2 className="font-serif text-3xl font-semibold text-foreground">Detalii cerere</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-xs text-foreground">{cerere.id}</span> · {cerere.tip}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            <ClipboardList className="mr-1 h-3.5 w-3.5" /> Cerere digitală
          </Badge>
          <Badge className="bg-success/15 text-success hover:bg-success/15">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Confirmată electronic
          </Badge>
          <StatusBadge status={cerere.status} />
        </div>
      </header>

      <Card className="space-y-2 border-border p-5 shadow-soft">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sumar cerere
        </p>
        <Row label="Cod cerere" value={cerere.id} mono />
        <Row label="Tip cerere" value={cerere.tip} />
        <Row label="Status" value={cerere.status} />
        <Row label="Data trimiterii" value={cerere.data} />
        <Row label="Solicitant" value={cerere.solicitant} />
        <Row label="Identitate solicitant" value="Verificată prin ROeID" />
        <Row label="Elev" value={cerere.elev} />
        <Row label="Clasă" value={cerere.clasa} />
        <Row label="Școală" value="Liceul Teoretic Onisifor Ghibu" />
      </Card>

      <Card className="space-y-2 border-border p-5 shadow-soft">
        <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground">
          <FileCheck2 className="h-4 w-4 text-primary" /> Date completate de solicitant
        </h3>
        {detalii.campuri.map((c) => (
          <Row key={c.label} label={c.label} value={c.value} mono={c.mono} />
        ))}
      </Card>

      <Card className="border-border p-5 shadow-soft">
        <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
          <Paperclip className="h-4 w-4 text-primary" /> Documente justificative
        </h3>
        {detalii.documente.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Această cerere nu necesită documente justificative.
          </p>
        ) : (
          <div className="space-y-2">
            {detalii.documente.map((d) => (
              <div
                key={d.nume}
                className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-foreground">{d.nume}</span>
                  <Badge variant="outline" className="border-border text-xs font-normal">
                    Document justificativ
                  </Badge>
                  <StareDocBadge stare={d.stare} />
                </div>
                <Button variant="ghost" size="sm">
                  Vezi
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 border-success/20 bg-success/5 p-5">
        <h3 className="flex items-center gap-2 font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> Confirmare electronică
        </h3>
        <div className="space-y-1">
          <Row label="Solicitant" value={detalii.confirmare.solicitant} compact />
          <Row label="Rol" value={detalii.confirmare.rol} compact />
          <Row label="Identitate" value="Verificată prin ROeID" compact />
          <Row label="Declarație confirmată" value={detalii.confirmare.declaratie} compact />
          <Row label="Data și ora confirmării" value={detalii.confirmare.dataOra} compact />
          <Row label="Cod cerere" value={cerere.id} compact mono />
        </div>
        <p className="text-xs leading-relaxed text-foreground/80">
          Cererea a fost confirmată electronic de solicitant, cu identitate verificată prin ROeID.
        </p>
      </Card>

      <Card className="border-border p-5 shadow-soft">
        <h3 className="mb-3 flex items-center gap-2 font-medium text-foreground">
          <History className="h-4 w-4 text-primary" /> Istoric acțiuni
        </h3>
        <ol className="space-y-3 text-sm">
          {detalii.istoric.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-primary" />
              <div>
                <p className="text-foreground/80">{e.text}</p>
                <p className="text-xs text-muted-foreground">{e.when}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => action("Cerere respinsă")}>
          <X className="mr-2 h-4 w-4" /> Respinge
        </Button>
        <Button variant="outline" onClick={() => setCompletariOpen(true)}>
          <AlertCircle className="mr-2 h-4 w-4" /> Cere completări
        </Button>
        <Button onClick={() => action("Cerere aprobată")}>
          <Check className="mr-2 h-4 w-4" /> Aprobă
        </Button>
      </div>

      <Dialog open={completariOpen} onOpenChange={setCompletariOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Cere completări</DialogTitle>
            <DialogDescription>
              Selectează ce trebuie completat. Părintele primește notificare cu lista
              exactă în dashboard-ul eElev.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {COMPLETARI_OPTIUNI.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm"
              >
                <Checkbox
                  checked={bifate.includes(opt)}
                  onCheckedChange={() => toggle(opt)}
                />
                <span className="text-foreground">{opt}</span>
              </label>
            ))}
            <div className="space-y-1.5">
              <Label className="text-sm">Altă completare</Label>
              <Textarea
                value={altaCompletare}
                onChange={(e) => setAltaCompletare(e.target.value)}
                placeholder="Descrie ce trebuie completat (opțional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setCompletariOpen(false)}>
              Anulează
            </Button>
            <Button onClick={trimiteCompletari}>Trimite cererea de completare</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
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
    <div
      className={`flex items-start justify-between gap-3 ${compact ? "" : "py-0.5"}`}
    >
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-right text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StareDocBadge({ stare }: { stare: DocStare }) {
  const map: Record<DocStare, { cls: string; node: ReactNode }> = {
    "Verificat": {
      cls: "bg-success/15 text-success hover:bg-success/15",
      node: "Verificat",
    },
    "Necesită verificare": {
      cls: "bg-warning/15 text-warning hover:bg-warning/15",
      node: "Necesită verificare",
    },
    "Opțional": {
      cls: "bg-muted text-muted-foreground hover:bg-muted",
      node: "Opțional",
    },
  };
  const { cls, node } = map[stare];
  return <Badge className={cls}>{node}</Badge>;
}
