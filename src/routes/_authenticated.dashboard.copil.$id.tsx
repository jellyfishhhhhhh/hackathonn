import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ShareDossierDialog } from "@/components/dashboard/share-dossier-dialog";
import { ArrowLeft, MapPin, GraduationCap, UserCheck, FileText, Download, Trophy, BookOpen, Award, Share2, ExternalLink, History, FolderCheck } from "lucide-react";
import { getChild } from "@/lib/children-store";
import type { Copil } from "@/lib/mock-data";
import { cereriRecente, documenteImportante, istoricScolar, premiiSiOlimpiade, getBeneficiiPentruElev } from "@/lib/mock-data";
import { useShares, revokeShare, SHARE_SECTIONS, formatShareDate, type SharedLink } from "@/lib/shares-store";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/copil/$id")({
  head: () => ({ meta: [{ title: "Dosar elev — eElev" }] }),
  component: DosarElev,
});

function DosarElev() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [copil, setCopil] = useState<Copil | undefined>(undefined);

  useEffect(() => {
    const c = getChild(id);
    if (!c) {
      navigate({ to: "/dashboard" });
      return;
    }
    if (c.status === "in_verificare") {
      navigate({ to: "/dashboard" });
      return;
    }
    setCopil(c);
  }, [id, navigate]);

  const shares = useShares(copil?.id);

  if (!copil) return null;

  const cereriElev = cereriRecente.filter((c) => c.elevId === copil.id);
  const docsVerificate = documenteImportante.filter((d) => d.status === "Verificat de școală").length;
  const beneficii = getBeneficiiPentruElev(copil);


  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Înapoi la panou
        </Link>
      </div>

      {/* Header */}
      <Card className="border-border p-6 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                  {copil.prenume} {copil.nume}
                </h1>
                <p className="text-sm text-muted-foreground">{copil.scoala}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {copil.localitate}</span>
              <span>Clasa {copil.clasa}</span>
              <span className="inline-flex items-center gap-1"><UserCheck className="h-3 w-3" /> Părinte: {copil.parinte}</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge status="Activ" />
          </div>
        </div>
      </Card>


      <Tabs defaultValue="prezentare" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
          <TabsTrigger value="prezentare">Prezentare generală</TabsTrigger>
          <TabsTrigger value="istoric">Istoric școlar</TabsTrigger>
          <TabsTrigger value="documente">Documente</TabsTrigger>
          <TabsTrigger value="cereri">Cereri</TabsTrigger>
          <TabsTrigger value="beneficii">Beneficii</TabsTrigger>
          <TabsTrigger value="admitere">Admitere</TabsTrigger>
          <TabsTrigger value="partajari">Linkuri partajate</TabsTrigger>
        </TabsList>

        <TabsContent value="prezentare" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Cereri active" value={cereriElev.filter((c) => c.status !== "Aprobată" && c.status !== "Respinsă").length} />
            <Stat label="Documente verificate" value={docsVerificate} />
            <Stat label="Beneficii disponibile" value={beneficii.filter((b) => b.status === "Eligibil").length} />
            <Stat label="Anul școlar" value="2025/26" />
          </div>
          <Card className="border-border p-5 shadow-soft">
            <h3 className="font-serif text-lg font-semibold text-foreground">Ultimele actualizări</h3>
            <div className="mt-3 space-y-3 text-sm">
              <UpdateRow text="Adeverința de elev a fost aprobată de secretariat." when="10.09.2026" />
              <UpdateRow text="Cererea pentru voucher cultural este în verificare la autoritatea locală." when="12.09.2026" />
              <UpdateRow text="Scutirea medicală necesită completări — încarcă diagnostic." when="08.09.2026" />
            </div>
          </Card>
          <AuditLogCard shares={shares} />

        </TabsContent>

        <TabsContent value="istoric" className="space-y-6">
          {/* Parcurs școlar — timeline */}
          <Card className="border-border p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Parcurs școlar</h3>
            </div>
            <div className="space-y-4">
              {istoricScolar.map((i, idx) => (
                <div key={i.id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                  {idx < istoricScolar.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
                  )}
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {i.an} · Clasa {i.clasa}
                    </p>
                    <span className="text-sm font-semibold text-primary">
                      Media {i.medie}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{i.scoala}</p>
                  {i.diriginte && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Diriginte: {i.diriginte}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    {typeof i.purtare === "number" && (
                      <Badge variant="secondary">Purtare {i.purtare}</Badge>
                    )}
                    {typeof i.absenteNemotivate === "number" && (
                      <Badge variant="outline">
                        {i.absenteNemotivate} absențe nemotivate
                      </Badge>
                    )}
                  </div>
                  {i.observatii && (
                    <p className="mt-1 text-xs italic text-muted-foreground">{i.observatii}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Premii și olimpiade */}
          <Card className="border-border p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-serif text-lg font-semibold">Premii și olimpiade</h3>
            </div>
            {premiiSiOlimpiade.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nu sunt premii sau participări înregistrate.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {premiiSiOlimpiade.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-accent text-primary">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{p.competitie}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.disciplina} · {p.organizator} · {p.an}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        {p.pozitie}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{p.nivel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </TabsContent>

        <TabsContent value="documente">
          <Card className="border-border p-0 shadow-soft">
            <div className="divide-y divide-border">
              {documenteImportante.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-accent text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{d.titlu}</p>
                    <p className="text-xs text-muted-foreground">{d.categorie} · {d.data}</p>
                  </div>
                  <StatusBadge status={d.status} />
                  <Button variant="outline" size="sm"><Download className="mr-2 h-3.5 w-3.5" />Descarcă</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cereri">
          <Card className="border-border p-0 shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tip cerere</TableHead>
                  <TableHead>Instituție</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cereriElev.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.tip}</TableCell>
                    <TableCell className="text-muted-foreground">{c.institutie}</TableCell>
                    <TableCell className="text-muted-foreground">{c.data}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="beneficii" className="grid gap-4 md:grid-cols-2">
          {beneficii.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3 border-border p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-serif text-lg font-semibold">{b.titlu}</p>
                  {b.suma && <p className="text-sm text-primary">{b.suma}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm text-muted-foreground">{b.descriere}</p>
            </Card>
          ))}
        </TabsContent>


        <TabsContent value="admitere">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-6 shadow-card">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-xl font-semibold text-foreground">Dosar pentru admitere</p>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    Generează un link verificabil cu documentele pentru admitere. Linkul poate fi
                    protejat cu cod de acces, are expirare automată și poate fi revocat oricând.
                  </p>
                </div>
              </div>
              <ShareDossierDialog
                childId={copil.id}
                trigger={
                  <Button>
                    <Share2 className="mr-2 h-4 w-4" /> Generează link admitere
                  </Button>
                }
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="partajari">
          <SharedLinksTab shares={shares} childId={copil.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-border p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function UpdateRow({ text, when }: { text: string; when: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <p className="text-foreground/80">{text}</p>
      <span className="flex-none text-xs text-muted-foreground">{when}</span>
    </div>
  );
}

function describeSections(sections: SharedLink["sections"]): string {
  if (sections.length === 0) return "—";
  const labels = sections
    .map((s) => SHARE_SECTIONS.find((x) => x.id === s)?.label ?? s)
    .map((l) => l.replace("Profil educațional de bază", "Profil").replace("Documente educaționale", "documente educaționale"));
  if (labels.length <= 2) return labels.join(" + ");
  return `${labels.slice(0, 2).join(" + ")} +${labels.length - 2}`;
}

function SharedLinksTab({ shares, childId }: { shares: SharedLink[]; childId: string }) {
  const handleRevoke = (id: string) => {
    revokeShare(id);
    toast.success("Accesul a fost revocat.");
  };

  return (
    <Card className="border-border p-0 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">Linkuri partajate</h3>
          <p className="text-sm text-muted-foreground">
            Gestionează accesul instituțiilor la informațiile selectate.
          </p>
        </div>
        <ShareDossierDialog
          childId={childId}
          trigger={
            <Button size="sm">
              <Share2 className="mr-2 h-3.5 w-3.5" /> Link nou
            </Button>
          }
        />
      </div>
      {shares.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nu există linkuri partajate. Generează unul pentru a oferi acces temporar unei instituții.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cod partajare</TableHead>
              <TableHead>Informații partajate</TableHead>
              <TableHead>Data generării</TableHead>
              <TableHead>Expiră la</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acțiune</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell className="text-sm">{describeSections(s.sections)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatShareDate(s.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatShareDate(s.expiresAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      s.status === "Activ"
                        ? "default"
                        : s.status === "Revocat"
                          ? "destructive"
                          : "secondary"
                    }
                    className={s.status === "Activ" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
                  >
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <a
                      href={`/verificare/${s.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent"
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" /> Vezi
                    </a>
                    {s.status === "Activ" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleRevoke(s.id)}
                      >
                        Revocă
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function AuditLogCard({ shares }: { shares: SharedLink[] }) {
  const entries = shares
    .flatMap((s) => s.accessLog.map((e) => ({ ...e, shareId: s.id })))
    .slice(0, 8);

  if (entries.length === 0) return null;

  return (
    <Card className="border-border p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <History className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-lg font-semibold text-foreground">Istoric acțiuni</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {entries.map((e, idx) => (
          <li
            key={`${e.shareId}-${idx}`}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-foreground/80">{e.text}</p>
              <p className="text-xs text-muted-foreground">Link {e.shareId}</p>
            </div>
            <span className="flex-none text-xs text-muted-foreground">{e.when}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
