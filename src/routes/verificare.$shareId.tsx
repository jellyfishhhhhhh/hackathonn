import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  FileText,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Clock,
  KeyRound,
  Award,
  BookOpen,
} from "lucide-react";
import {
  getShareById,
  markAccessed,
  SHARE_SECTIONS,
  formatShareDate,
  type SharedLink,
} from "@/lib/shares-store";
import { getChild } from "@/lib/children-store";
import { copiiInitiali, documenteImportante, istoricScolar, premiiSiOlimpiade } from "@/lib/mock-data";

export const Route = createFileRoute("/verificare/$shareId")({
  head: () => ({ meta: [{ title: "Acces dosar eElev — eElev" }] }),
  component: VerificarePage,
});

function VerificarePage() {
  const { shareId } = Route.useParams();
  const [share, setShare] = useState<SharedLink | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setShare(getShareById(shareId));
    setLoaded(true);
  }, [shareId]);

  const submit = () => {
    if (!code.trim()) {
      setError("Introdu codul de acces pentru a continua.");
      return;
    }
    setError(null);
    setGranted(true);
    if (share) markAccessed(share.id);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif text-lg font-semibold leading-tight text-foreground">eElev</p>
            <p className="text-xs text-muted-foreground">Acces dosar eElev partajat</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {!loaded ? null : !share ? (
          <NoticeCard
            tone="error"
            title="Link invalid"
            text="Acest link de partajare nu există sau a fost șters de titular."
          />
        ) : share.status === "Revocat" ? (
          <NoticeCard
            tone="error"
            title="Acces revocat"
            text="Accesul la acest dosar a fost dezactivat de titular sau reprezentantul legal."
            icon={ShieldOff}
          />
        ) : share.status === "Expirat" ? (
          <NoticeCard
            tone="warning"
            title="Link expirat"
            text="Accesul la acest dosar nu mai este disponibil. Solicită un nou link persoanei care l-a generat."
            icon={Clock}
          />
        ) : !granted ? (
          <Card className="space-y-5 border-border p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-foreground">
                  Acces dosar eElev
                </h1>
                <p className="text-sm text-muted-foreground">
                  Introdu codul de acces pentru a vizualiza informațiile partajate.
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Cod partajare
              </p>
              <p className="font-mono font-medium text-foreground">{share.id}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cod">Cod de acces</Label>
              <Input
                id="cod"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••"
                inputMode="numeric"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <Button onClick={submit} className="w-full sm:w-auto">
              Accesează
            </Button>

            <p className="text-xs text-muted-foreground">
              Persoanele care primesc linkul pot vedea doar informațiile selectate și doar pe
              perioada stabilită.
            </p>
          </Card>
        ) : (
          <SharedDossierView share={share} />
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            eelev.online
          </Link>
        </div>
      </main>
    </div>
  );
}

function SharedDossierView({ share }: { share: SharedLink }) {
  const copil =
    getChild(share.childId) ??
    copiiInitiali.find((c) => c.id === share.childId) ??
    copiiInitiali[0];

  const has = (k: (typeof SHARE_SECTIONS)[number]["id"]) => share.sections.includes(k);

  const docsByCategory = (cats: string[]) =>
    documenteImportante.filter((d) => cats.includes(d.categorie));

  const docs: typeof documenteImportante = [];
  if (has("documente")) docs.push(...docsByCategory(["Adeverință", "Istoric"]));
  if (has("diplome")) docs.push(...docsByCategory(["Diplomă"]));
  if (has("voluntariat")) docs.push(...docsByCategory(["Voluntariat"]));
  if (has("admitere")) docs.push(...docsByCategory(["Admitere", "Istoric", "Diplomă"]));
  // dedupe
  const uniqueDocs = Array.from(new Map(docs.map((d) => [d.id, d])).values());

  return (
    <div className="space-y-6">
      <Card className="space-y-4 border-border p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Dosar eElev partajat
            </h1>
            <p className="text-sm text-muted-foreground">
              Cod partajare:{" "}
              <span className="font-mono text-foreground">{share.id}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              Acces temporar
            </Badge>
            <span className="text-xs text-muted-foreground">
              Valabil până la {formatShareDate(share.expiresAt)}
            </span>
          </div>
        </div>

        {has("profil") && (
          <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-2">
            <Field label="Nume elev" value={`${copil.prenume} ${copil.nume}`} />
            <Field label="Școală" value={copil.scoala} />
            <Field label="Clasă" value={copil.clasa} />
            <Field label="Status elev" value="Activ" />
            <div className="sm:col-span-2">
              <Field
                label="Status verificare"
                value="Confirmat de școală"
                icon={ShieldCheck}
              />
            </div>
          </div>
        )}
      </Card>

      {has("istoric") && (
        <Card className="border-border p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Istoric școlar</h2>
          </div>
          <div className="space-y-2">
            {istoricScolar.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {i.an} · Clasa {i.clasa}
                  </p>
                  <p className="text-xs text-muted-foreground">{i.scoala}</p>
                </div>
                <span className="text-xs text-muted-foreground">Media {i.medie}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(has("documente") || has("diplome") || has("voluntariat") || has("admitere")) && (
        <Card className="border-border p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Documente partajate
            </h2>
          </div>
          {uniqueDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nu sunt documente partajate pentru această categorie.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {uniqueDocs.map((d) => (
                <div key={d.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-accent text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{d.titlu}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.categorie} · {copil.scoala} · {d.data}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
          {!share.allowDownload && (
            <p className="mt-4 text-xs text-muted-foreground">
              Descărcarea documentelor nu este permisă pentru acest link. Doar vizualizare.
            </p>
          )}
        </Card>
      )}

      {has("diplome") && premiiSiOlimpiade.length > 0 && (
        <Card className="border-border p-6 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Premii și certificate
            </h2>
          </div>
          <div className="divide-y divide-border">
            {premiiSiOlimpiade.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.competitie}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.disciplina} · {p.organizator} · {p.an}
                  </p>
                </div>
                <Badge variant="secondary">{p.pozitie}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Persoanele care primesc linkul pot vedea doar informațiile selectate și doar pe perioada
        stabilită.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-success" />}
        {value}
      </p>
    </div>
  );
}

function NoticeCard({
  tone,
  title,
  text,
  icon: Icon = ShieldAlert,
}: {
  tone: "error" | "warning";
  title: string;
  text: string;
  icon?: React.ElementType;
}) {
  const cls =
    tone === "error"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-amber-400/30 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200";
  return (
    <Card className={`flex items-start gap-3 p-6 shadow-soft ${cls}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-none" />
      <div>
        <h1 className="font-serif text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm opacity-90">{text}</p>
      </div>
    </Card>
  );
}
