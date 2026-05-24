import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { GraduationCap, MapPin, ArrowRight, FileText, UserPlus, Clock } from "lucide-react";
import type { Copil } from "@/lib/mock-data";

export function ChildCard({ copil }: { copil: Copil }) {
  if (copil.status === "in_verificare") {
    return (
      <Card className="flex flex-col gap-4 border-border bg-muted/30 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <StatusBadge status="În verificare" />
        </div>
        <div>
          <p className="font-serif text-lg font-semibold text-foreground">Asociere în curs</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cererea de asociere a fost trimisă. Datele elevului vor fi afișate după verificare.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5 border-border p-5 shadow-soft transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <StatusBadge status="Asociere confirmată" />
      </div>

      <div className="space-y-2">
        <p className="font-serif text-xl font-semibold text-foreground">
          {copil.prenume} {copil.nume}
        </p>
        <p className="text-sm text-foreground/80">{copil.scoala}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {copil.localitate}
          </span>
          <span>Clasa {copil.clasa}</span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <Link to="/dashboard/copil/$id" params={{ id: copil.id }}>
            Deschide dosar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" className="flex-1">
          <FileText className="mr-2 h-4 w-4" /> Cerere nouă
        </Button>
      </div>
    </Card>
  );
}

export function AddChildCard() {
  return (
    <Card className="flex flex-col gap-4 border-2 border-dashed border-border bg-background p-5 shadow-none">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
        <UserPlus className="h-5 w-5" />
      </div>
      <div>
        <p className="font-serif text-lg font-semibold text-foreground">Adaugă copil</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Asociază un copil contului tău prin verificare ROeID și confirmare școlară.
        </p>
      </div>
      <Button asChild variant="outline" className="mt-auto">
        <Link to="/dashboard/adauga-copil">Începe asocierea</Link>
      </Button>
    </Card>
  );
}
