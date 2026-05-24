import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Phone,
  ShieldCheck,
  Bell,
  AlertTriangle,
  Trash2,
  Bug,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/setari")({
  head: () => ({ meta: [{ title: "Setări — eElev" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [telefon, setTelefon] = useState("+40 7xx xxx xxx");
  const [pushOn, setPushOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-content-center rounded-md bg-primary/10 text-primary">
            <SettingsIcon className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-3xl text-foreground">Setări</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestionează datele contului, consimțământul și suportul în eElev.
        </p>
      </header>

      {/* Setări cont */}
      <Card className="border-border p-6 shadow-soft">
        <SectionTitle icon={<SettingsIcon className="h-4 w-4" />}>
          Setări cont
        </SectionTitle>

        {/* Telefon */}
        <Block>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Număr de telefon
              </div>
              <p className="text-xs text-muted-foreground">
                Folosit pentru notificări importante privind cererile și
                documentele.
              </p>
              <p className="font-mono text-sm text-foreground">{telefon}</p>
            </div>
            <PhoneChangeDialog
              current={telefon}
              onSaved={(t) => setTelefon(t)}
            />
          </div>
        </Block>

        {/* Ultima autentificare */}
        <Block>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Ultima autentificare
            </div>
            <p className="text-sm text-foreground">
              23.05.2026, 14:32
            </p>
            <p className="text-xs text-muted-foreground">Metodă: ROeID</p>
            <Badge className="bg-success/15 text-success hover:bg-success/15">
              Identitate verificată
            </Badge>
          </div>
        </Block>

        {/* Notificări */}
        <Block last>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notificări
            </div>
            <ToggleRow
              label="Notificări push"
              checked={pushOn}
              onChange={setPushOn}
            />
            <ToggleRow
              label="Notificări SMS"
              checked={smsOn}
              onChange={setSmsOn}
            />
            <p className="text-xs text-muted-foreground">
              Poți primi notificări despre cereri aprobate, completări necesare,
              documente emise și termene limită.
            </p>
          </div>
        </Block>
      </Card>

      {/* Date și consimțământ */}
      <Card className="border-border p-6 shadow-soft">
        <SectionTitle icon={<ShieldCheck className="h-4 w-4" />}>
          Date și consimțământ
        </SectionTitle>

        <p className="text-sm text-muted-foreground">
          Datele tale sunt folosite pentru accesarea serviciilor educaționale
          digitale, gestionarea cererilor și verificarea documentelor. Unele
          date educaționale oficiale pot fi păstrate conform obligațiilor
          legale.
        </p>

        <div className="mt-4 flex gap-3 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Ștergerea contului nu poate elimina automat documentele oficiale
            care trebuie păstrate de instituțiile de învățământ conform
            legislației aplicabile. Poți solicita ștergerea sau anonimizarea
            datelor care nu mai sunt necesare.
          </p>
        </div>

        <div className="mt-5">
          <DeleteAccountDialog />
        </div>
      </Card>

      {/* Suport și feedback */}
      <Card className="border-border p-6 shadow-soft">
        <SectionTitle icon={<MessageSquare className="h-4 w-4" />}>
          Suport și feedback
        </SectionTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <SupportItem
            icon={<Bug className="h-4 w-4 text-muted-foreground" />}
            title="Raportează o problemă"
            description="Semnalează o eroare tehnică, o problemă de autentificare sau o dificultate în folosirea platformei."
            action={<ReportIssueDialog />}
          />
          <SupportItem
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            title="Trimite feedback"
            description="Trimite sugestii pentru îmbunătățirea serviciilor disponibile în eElev."
            action={<FeedbackDialog />}
          />
        </div>
      </Card>
    </div>
  );
}

/* ---------- Layout helpers ---------- */

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function Block({
  children,
  last,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "py-4" : "border-b border-border py-4 first:pt-0"}>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function SupportItem({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {title}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-auto">{action}</div>
    </div>
  );
}

/* ---------- Dialogs ---------- */

function PhoneChangeDialog({
  current,
  onSaved,
}: {
  current: string;
  onSaved: (t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setCode("");
      }, 200);
    }
  };

  const sendCode = () => {
    if (!phone.trim()) return;
    toast.success("Cod de verificare trimis prin SMS.");
    setStep("code");
  };

  const confirm = () => {
    if (!code.trim()) return;
    onSaved(phone);
    toast.success("Numărul de telefon a fost actualizat.");
    reset(false);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Schimbă numărul de telefon
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Schimbă numărul de telefon
          </DialogTitle>
          <DialogDescription>
            Număr curent: <span className="font-mono">{current}</span>
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-sm">Număr nou de telefon</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+40 7xx xxx xxx"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => reset(false)}>
                Anulează
              </Button>
              <Button onClick={sendCode} disabled={!phone.trim()}>
                Trimite cod de verificare
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label className="text-sm">Cod SMS</Label>
              <Input
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 cifre"
              />
              <p className="text-xs text-muted-foreground">
                Am trimis un cod la <span className="font-mono">{phone}</span>.
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => reset(false)}>
                Anulează
              </Button>
              <Button onClick={confirm} disabled={!code.trim()}>
                Confirmă modificarea
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [reason, setReason] = useState("");

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setAgree(false);
        setReason("");
      }, 200);
    }
  };

  const submit = () => {
    toast.success(
      "Solicitarea de ștergere a contului a fost înregistrată. Vei primi un răspuns după verificarea cererii.",
    );
    reset(false);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Solicită ștergerea contului
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Solicitare ștergere cont
          </DialogTitle>
          <DialogDescription>
            Această acțiune va trimite o cerere de ștergere a contului și a
            datelor personale care pot fi eliminate conform Regulamentului
            General privind Protecția Datelor (GDPR). Datele care trebuie
            păstrate legal de instituții pot rămâne arhivate conform
            legislației.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground">
            <Checkbox
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
              className="mt-0.5"
            />
            <span>
              Înțeleg că această solicitare poate afecta accesul la serviciile
              eElev.
            </span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-sm">Motivul solicitării, opțional</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Lasă gol dacă nu este cazul"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => reset(false)}>
            Anulează
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!agree}>
            Trimite solicitarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportIssueDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setCategory("");
        setDescription("");
      }, 200);
    }
  };

  const submit = () => {
    toast.success("Raportarea a fost trimisă. Mulțumim!");
    reset(false);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Raportează
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Raportează o problemă
          </DialogTitle>
          <DialogDescription>
            Echipa de suport eElev va verifica raportarea în cel mai scurt timp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-sm">Categorie problemă</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autentificare">Autentificare</SelectItem>
                <SelectItem value="cerere">Cerere administrativă</SelectItem>
                <SelectItem value="documente">Documente</SelectItem>
                <SelectItem value="notificari">Notificări</SelectItem>
                <SelectItem value="alta">Altă problemă</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Descriere problemă</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Descrie pe scurt problema întâmpinată"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">
              Atașează captură de ecran (opțional)
            </Label>
            <Input type="file" accept="image/*" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => reset(false)}>
            Anulează
          </Button>
          <Button
            onClick={submit}
            disabled={!category || !description.trim()}
          >
            Trimite raportarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<string>("");

  const reset = (o: boolean) => {
    setOpen(o);
    if (!o) {
      setTimeout(() => {
        setFeedback("");
        setRating("");
      }, 200);
    }
  };

  const submit = () => {
    toast.success("Mulțumim pentru feedback!");
    reset(false);
  };

  return (
    <Dialog open={open} onOpenChange={reset}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Trimite feedback
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Trimite feedback
          </DialogTitle>
          <DialogDescription>
            Părerea ta ne ajută să îmbunătățim platforma eElev.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-sm">Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Scrie sugestia sau impresia ta"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Cât de utilă este platforma?</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Alege o opțiune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="foarte-utila">Foarte utilă</SelectItem>
                <SelectItem value="utila">Utilă</SelectItem>
                <SelectItem value="neutra">Neutră</SelectItem>
                <SelectItem value="imbunatatiri">
                  Necesită îmbunătățiri
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => reset(false)}>
            Anulează
          </Button>
          <Button onClick={submit} disabled={!feedback.trim() || !rating}>
            Trimite feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
