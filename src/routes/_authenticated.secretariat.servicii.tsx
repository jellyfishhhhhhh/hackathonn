import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  HeartPulse,
  LogOut,
  Gift,
  Info,
  Settings2,
  Eye,
  Power,
  Plus,
  X,
  ArrowRight,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/secretariat/servicii")({
  head: () => ({
    meta: [
      { title: "Servicii școlare — Secretariat" },
      {
        name: "description",
        content:
          "Gestionează serviciile digitale oferite elevilor și părinților asociați Liceului Teoretic Onisifor Ghibu.",
      },
    ],
  }),
  component: ServiciiScolarePage,
});

type Serviciu = {
  id: string;
  titlu: string;
  icon: LucideIcon;
  categorie: string;
  eligibili: string;
  dateNecesare: string[];
  documenteNecesare: string[];
  fluxAprobare: string[];
  statusuriPosibile: string[];
  mesajParinti: string;
  termenZile: number;
  status: "Activ" | "Inactiv";
};

const SERVICII_INIT: Serviciu[] = [
  {
    id: "adeverinta",
    titlu: "Adeverință elev",
    icon: FileText,
    categorie: "Document școlar",
    eligibili: "Elevi ai Liceului Teoretic Onisifor Ghibu",
    dateNecesare: ["Elev asociat contului", "Clasă", "Scopul adeverinței"],
    documenteNecesare: [],
    fluxAprobare: ["Părinte / elev major", "Secretariat"],
    statusuriPosibile: ["Trimisă", "În verificare", "Aprobată", "Necesită completări"],
    mesajParinti:
      "Adeverința este emisă electronic de secretariat în maxim 3 zile lucrătoare.",
    termenZile: 3,
    status: "Activ",
  },
  {
    id: "scutire-medicala",
    titlu: "Scutire medicală",
    icon: HeartPulse,
    categorie: "Document medical / motivare absențe",
    eligibili: "Elevi ai Liceului Teoretic Onisifor Ghibu",
    dateNecesare: ["Elev asociat contului", "Perioadă absență"],
    documenteNecesare: ["Document medical atașat"],
    fluxAprobare: ["Părinte", "Secretariat / Diriginte"],
    statusuriPosibile: ["Trimisă", "În verificare", "Aprobată", "Necesită completări", "Respinsă"],
    mesajParinti:
      "Încarcă documentul medical emis de cabinet. Dirigintele primește notificare automată.",
    termenZile: 2,
    status: "Activ",
  },
  {
    id: "invoire",
    titlu: "Învoire / plecare din școală",
    icon: LogOut,
    categorie: "Aprobare școlară",
    eligibili: "Elevi ai Liceului Teoretic Onisifor Ghibu",
    dateNecesare: [
      "Motiv",
      "Data și ora plecării",
      "Persoană care preia elevul (dacă este cazul)",
    ],
    documenteNecesare: [],
    fluxAprobare: ["Elev / Părinte", "Părinte confirmă", "Secretariat / Diriginte"],
    statusuriPosibile: ["Trimisă", "Aprobată", "Respinsă"],
    mesajParinti:
      "Învoirea este vizibilă în catalog după confirmarea dirigintelui sau a secretariatului.",
    termenZile: 1,
    status: "Activ",
  },
  {
    id: "voucher-cultural",
    titlu: "Voucher cultural — 700 lei",
    icon: Gift,
    categorie: "Beneficiu local",
    eligibili:
      "Elevi eligibili ai Liceului Teoretic Onisifor Ghibu (Clasa a IX-a, Cluj-Napoca)",
    dateNecesare: ["Elev asociat contului", "IBAN părinte / tutore"],
    documenteNecesare: ["Extras de cont (dacă este necesar)"],
    fluxAprobare: ["Părinte", "Secretariat", "Autoritate locală"],
    statusuriPosibile: ["Trimisă", "În verificare", "Aprobată", "Respinsă"],
    mesajParinti:
      "Voucherul este virat de autoritatea locală după validarea secretariatului.",
    termenZile: 14,
    status: "Activ",
  },
  {
    id: "voucher-sportiv",
    titlu: "Voucher sportiv — 700 lei",
    icon: Gift,
    categorie: "Beneficiu local",
    eligibili:
      "Elevi eligibili ai Liceului Teoretic Onisifor Ghibu (Clasa a III-a, Cluj-Napoca)",
    dateNecesare: ["Elev asociat contului", "IBAN părinte / tutore"],
    documenteNecesare: ["Extras de cont (dacă este necesar)"],
    fluxAprobare: ["Părinte", "Secretariat", "Autoritate locală"],
    statusuriPosibile: ["Trimisă", "În verificare", "Aprobată", "Respinsă"],
    mesajParinti:
      "Voucherul este virat de autoritatea locală după validarea secretariatului.",
    termenZile: 14,
    status: "Activ",
  },
];

function ServiciiScolarePage() {
  const [servicii, setServicii] = useState<Serviciu[]>(SERVICII_INIT);
  const [vezi, setVezi] = useState<Serviciu | null>(null);
  const [editeaza, setEditeaza] = useState<Serviciu | null>(null);
  const [adauga, setAdauga] = useState(false);

  const toggleStatus = (id: string) => {
    setServicii((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next: Serviciu = {
          ...s,
          status: s.status === "Activ" ? "Inactiv" : "Activ",
        };
        toast.success(
          next.status === "Activ"
            ? `„${s.titlu}” a fost activat pentru părinți.`
            : `„${s.titlu}” a fost dezactivat. Părinții nu îl mai pot solicita.`
        );
        return next;
      })
    );
  };

  const saveEdit = (next: Serviciu) => {
    setServicii((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    setEditeaza(null);
    toast.success("Modificările au fost salvate.");
  };

  const addServiciu = (next: Serviciu) => {
    setServicii((prev) => [next, ...prev]);
    setAdauga(false);
    toast.success(`„${next.titlu}” a fost adăugat (doar pentru această sesiune).`);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Servicii școlare
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Configurează serviciile disponibile pentru elevii asociați școlii.
          </p>
        </div>
        <Button onClick={() => setAdauga(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Adaugă serviciu
        </Button>
      </header>

      <p className="text-xs text-muted-foreground">
        Regulile legale și datele de identitate nu pot fi modificate din această pagină.
        Serviciile adăugate aici sunt vizibile doar în această sesiune.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {servicii.map((s) => (
          <ServiciuCard
            key={s.id}
            serviciu={s}
            onVezi={() => setVezi(s)}
            onEditeaza={() => setEditeaza(s)}
            onToggle={() => toggleStatus(s.id)}
          />
        ))}
      </div>


      <ReguliDialog serviciu={vezi} onClose={() => setVezi(null)} />
      <EditFluxDialog
        serviciu={editeaza}
        onClose={() => setEditeaza(null)}
        onSave={saveEdit}
      />
      <AddServiciuDialog
        open={adauga}
        onClose={() => setAdauga(false)}
        onSave={addServiciu}
      />
    </div>
  );
}

function AddServiciuDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: Serviciu) => void;
}) {
  const [titlu, setTitlu] = useState("");
  const [categorie, setCategorie] = useState("");
  const [eligibili, setEligibili] = useState("");
  const [mesajParinti, setMesajParinti] = useState("");
  const [termenZile, setTermenZile] = useState(3);
  const [documente, setDocumente] = useState<string[]>([]);
  const [flux, setFlux] = useState<string[]>(["Părinte", "Secretariat"]);

  useEffect(() => {
    if (open) {
      setTitlu("");
      setCategorie("");
      setEligibili("");
      setMesajParinti("");
      setTermenZile(3);
      setDocumente([]);
      setFlux(["Părinte", "Secretariat"]);
    }
  }, [open]);

  const handleSave = () => {
    if (!titlu.trim() || !categorie.trim()) {
      toast.error("Completează titlul și categoria.");
      return;
    }
    onSave({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `serv-${Date.now()}`,
      titlu: titlu.trim(),
      icon: FileText,
      categorie: categorie.trim(),
      eligibili: eligibili.trim() || "Elevi ai Liceului Teoretic Onisifor Ghibu",
      dateNecesare: [],
      documenteNecesare: documente,
      fluxAprobare: flux,
      statusuriPosibile: ["Trimisă", "În verificare", "Aprobată", "Respinsă"],
      mesajParinti: mesajParinti.trim(),
      termenZile: termenZile || 1,
      status: "Activ",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Adaugă serviciu nou</DialogTitle>
          <DialogDescription>
            Serviciul va fi vizibil doar în această sesiune și nu este salvat permanent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-sm">Titlu</Label>
            <Input value={titlu} onChange={(e) => setTitlu(e.target.value)} placeholder="ex: Cerere transfer" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Categorie</Label>
            <Input value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="ex: Document școlar" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Disponibil pentru</Label>
            <Textarea value={eligibili} onChange={(e) => setEligibili(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Mesaj afișat părinților</Label>
            <Textarea value={mesajParinti} onChange={(e) => setMesajParinti(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Termen estimat (zile)</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={termenZile}
              onChange={(e) => setTermenZile(Number(e.target.value) || 1)}
            />
          </div>
          <EditableList
            label="Documente cerute"
            items={documente}
            onChange={setDocumente}
            placeholder="ex: Copie CI părinte"
          />
          <EditableList
            label="Pași de aprobare"
            items={flux}
            onChange={setFlux}
            placeholder="ex: Director"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>Anulează</Button>
          <Button onClick={handleSave}>Adaugă serviciu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ServiciuCard({
  serviciu,
  onVezi,
  onEditeaza,
  onToggle,
}: {
  serviciu: Serviciu;
  onVezi: () => void;
  onEditeaza: () => void;
  onToggle: () => void;
}) {
  const Icon = serviciu.icon;
  const activ = serviciu.status === "Activ";
  return (
    <Card className="flex flex-col gap-4 border-border p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
              {serviciu.titlu}
            </h3>
            <Badge variant="outline" className="mt-1.5 border-border text-xs font-normal">
              {serviciu.categorie}
            </Badge>
          </div>
        </div>
        <Badge
          className={
            activ
              ? "bg-success/15 text-success hover:bg-success/15"
              : "bg-muted text-muted-foreground hover:bg-muted"
          }
        >
          {serviciu.status}
        </Badge>
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Disponibil pentru
        </p>
        <p className="text-foreground">{serviciu.eligibili}</p>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onVezi}>
          <Eye className="mr-1.5 h-4 w-4" /> Vezi reguli
        </Button>
        <Button variant="outline" size="sm" onClick={onEditeaza}>
          <Settings2 className="mr-1.5 h-4 w-4" /> Editează flux
        </Button>
        <Button
          variant={activ ? "outline" : "default"}
          size="sm"
          onClick={onToggle}
        >
          <Power className="mr-1.5 h-4 w-4" />
          {activ ? "Dezactivează" : "Activează"}
        </Button>
      </div>
    </Card>
  );
}

function ReguliDialog({
  serviciu,
  onClose,
}: {
  serviciu: Serviciu | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!serviciu} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {serviciu && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Reguli — {serviciu.titlu}
              </DialogTitle>
              <DialogDescription>
                Reguli și flux configurat în cadrul Liceului Teoretic Onisifor Ghibu.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <Section title="Cine este eligibil">
                <p className="text-sm text-foreground">{serviciu.eligibili}</p>
              </Section>
              <Section title="Date necesare">
                <BulletList items={serviciu.dateNecesare} />
              </Section>
              <Section title="Documente necesare">
                {serviciu.documenteNecesare.length > 0 ? (
                  <BulletList items={serviciu.documenteNecesare} />
                ) : (
                  <p className="text-sm text-muted-foreground">Niciun document obligatoriu.</p>
                )}
              </Section>
              <Section title="Cine aprobă">
                <ol className="space-y-1 text-sm text-foreground">
                  {serviciu.fluxAprobare.map((p, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      {p}
                    </li>
                  ))}
                </ol>
              </Section>
              <Section title="Statusuri posibile">
                <div className="flex flex-wrap gap-1.5">
                  {serviciu.statusuriPosibile.map((st) => (
                    <Badge key={st} variant="outline" className="border-border font-normal">
                      {st}
                    </Badge>
                  ))}
                </div>
              </Section>
            </div>

            <DialogFooter>
              <Button onClick={onClose}>Închide</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditFluxDialog({
  serviciu,
  onClose,
  onSave,
}: {
  serviciu: Serviciu | null;
  onClose: () => void;
  onSave: (s: Serviciu) => void;
}) {
  const [draft, setDraft] = useState<Serviciu | null>(serviciu);

  // sync when opened
  useEffect(() => setDraft(serviciu), [serviciu]);

  if (!serviciu || !draft) {
    return (
      <Dialog open={false} onOpenChange={(o) => !o && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const update = <K extends keyof Serviciu>(key: K, value: Serviciu[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <Dialog open={!!serviciu} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Editează flux — {draft.titlu}
          </DialogTitle>
          <DialogDescription>
            Configurări locale ale serviciului în cadrul școlii. Regulile legale
            rămân stabilite de autoritate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <p className="text-sm font-medium text-foreground">Serviciu activ</p>
              <p className="text-xs text-muted-foreground">
                Dacă este dezactivat, părinții nu îl pot solicita.
              </p>
            </div>
            <Switch
              checked={draft.status === "Activ"}
              onCheckedChange={(v) => update("status", v ? "Activ" : "Inactiv")}
            />
          </div>

          <EditableList
            label="Documente cerute"
            items={draft.documenteNecesare}
            onChange={(items) => update("documenteNecesare", items)}
            placeholder="ex: Document medical atașat"
          />

          <div className="space-y-1.5">
            <Label className="text-sm">Mesaj afișat părinților</Label>
            <Textarea
              value={draft.mesajParinti}
              onChange={(e) => update("mesajParinti", e.target.value)}
              rows={3}
            />
          </div>

          <EditableList
            label="Pași de aprobare"
            items={draft.fluxAprobare}
            onChange={(items) => update("fluxAprobare", items)}
            placeholder="ex: Secretariat"
          />

          <div className="space-y-1.5">
            <Label className="text-sm">Termen estimat de procesare (zile)</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={draft.termenZile}
              onChange={(e) => update("termenZile", Number(e.target.value) || 1)}
            />
          </div>

          <div className="flex gap-3 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Nu pot fi modificate: regulile legale de eligibilitate stabilite de
              autoritatea locală, suma beneficiului, regulile naționale și datele
              de identitate ROeID.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={() => onSave(draft)}>Salvează modificările</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditableList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [nou, setNou] = useState("");
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <ul className="space-y-1.5">
        {items.length === 0 && (
          <li className="text-xs text-muted-foreground">Niciun element adăugat.</li>
        )}
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm"
          >
            <span className="text-foreground">{it}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label="Elimină"
            >
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={nou}
          onChange={(e) => setNou(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          variant="outline"
          onClick={() => {
            if (!nou.trim()) return;
            onChange([...items, nou.trim()]);
            setNou("");
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Adaugă
        </Button>
      </div>
    </div>
  );
}

function ParentPreviewCard() {
  const pasi = [
    "Verificare eligibilitate",
    "Confirmare date",
    "Adăugare IBAN",
    "Confirmare electronică",
    "Urmărire status",
  ];
  return (
    <Card className="space-y-4 border-accent/40 bg-accent/20 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Cum vede părintele acest serviciu
        </p>
        <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">
          Voucher cultural — 700 lei
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Eligibil pentru elevii de clasa a IX-a din Cluj-Napoca.
        </p>
      </div>

      <Button
        onClick={() =>
          toast.info("Previzualizare deschisă.")
        }
      >
        Aplică
      </Button>

      <ol className="space-y-2">
        {pasi.map((p, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {i + 1}
            </span>
            <span className="text-foreground">{p}</span>
            {i < pasi.length - 1 && (
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground sm:ml-0" />
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-sm text-foreground">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-muted-foreground">•</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
