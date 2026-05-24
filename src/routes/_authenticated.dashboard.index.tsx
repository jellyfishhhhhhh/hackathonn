import { createFileRoute, Link } from "@tanstack/react-router";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSignature,
  FolderArchive,
  Gift,
  GraduationCap,
  Settings,
  Users,
  Inbox,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { useChildren } from "@/lib/children-store";
import { documenteImportante, getBeneficiiPentruElev } from "@/lib/mock-data";
import { useRequests } from "@/lib/requests-store";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Panou principal — eElev" }] }),
  component: Dashboard,
});

function Dashboard() {
  const copii = useChildren();
  const elevActiv = copii[0];
  const beneficii = elevActiv ? getBeneficiiPentruElev(elevActiv) : [];
  const myRequests = useRequests();

  const eleviCount = copii.length;
  const cereriActive = myRequests.filter(
    (r) => r.status !== "Aprobată" && r.status !== "Respinsă",
  ).length;
  const docVerificate = documenteImportante.filter(
    (d) => d.status === "Verificat de școală",
  ).length;
  const beneficiiDisp = beneficii.filter((b) => b.status === "Eligibil").length;

  return (
    <div className="space-y-10">
      <WelcomeSection />

      {/* Summary */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <SummaryStat icon={Users} label="Elevi asociați" value={eleviCount} />
          <SummaryStat icon={Inbox} label="Cereri active" value={cereriActive} />
          <SummaryStat icon={FileCheck2} label="Documente verificate" value={docVerificate} />
          <SummaryStat icon={Sparkles} label="Beneficii disponibile" value={beneficiiDisp} />
        </div>
      </section>

      {/* Copiii mei */}
      <section className="space-y-4">
        <SectionHeader title="Copiii mei" />
        <Card className="border-border p-0 shadow-soft">
          {copii.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Niciun elev asociat încă.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {copii.map((c) => (
                <li key={c.id}>
                  <ChildRow copil={c} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Link to="/dashboard/adauga-copil">
              <Plus className="mr-1.5 h-4 w-4" /> Adaugă copil
            </Link>
          </Button>
        </div>
      </section>

      {/* Navighează */}
      <section className="space-y-4">
        <SectionHeader title="Navighează" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NavCard to="/dashboard/cereri" icon={FileSignature} title="Cereri" description="Trimite și urmărește cereri către secretariat." />
          <NavCard to="/dashboard/documente" icon={FolderArchive} title="Documente" description="Adeverințe, diplome și istoric școlar." />
          <NavCard to="/dashboard/beneficii" icon={Gift} title="Beneficii" description="Programe locale și naționale pentru elevi." />
          
          <NavCard to="/dashboard/setari" icon={Settings} title="Setări" description="Contul și preferințele de notificare." />
        </div>
      </section>
    </div>
  );
}

function SummaryStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-3 border-border p-4 shadow-soft sm:p-5">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-2xl font-semibold leading-none text-foreground">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function ChildRow({ copil }: { copil: ReturnType<typeof useChildren>[number] }) {
  const pending = copil.status === "in_verificare";
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold text-foreground">
            {pending ? "Asociere în curs" : `${copil.prenume} ${copil.nume}`}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {pending ? "Datele elevului vor fi afișate după verificare." : `${copil.scoala} · Clasa ${copil.clasa}`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <StatusBadge status={pending ? "În verificare" : "Asociere confirmată"} />
        {!pending && (
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/copil/$id" params={{ id: copil.id }}>
              Deschide <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function NavCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="group block">
      <Card className="flex h-full flex-col gap-3 border-border p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <p className="font-serif text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Deschide
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Card>
    </Link>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="font-serif text-2xl font-semibold text-foreground">{title}</h2>;
}
