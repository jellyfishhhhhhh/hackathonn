import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DigitalRequestDialog } from "@/components/dashboard/digital-request-dialog";
import { FolderCheck, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/admitere")({
  head: () => ({ meta: [{ title: "Dosar pentru admitere — eElev" }] }),
  component: Admitere,
});

function Admitere() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Dosar pentru admitere
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Selectează documentele relevante și generează un dosar digital verificabil pentru
          universități sau alte instituții. Linkul poate fi protejat cu un cod de acces și
          poate expira automat.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-6 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-xl font-semibold text-foreground">Generează un dosar nou</p>
              <p className="text-sm text-muted-foreground">
                Documentele rămân pe portal — instituția primește doar un link verificabil.
              </p>
            </div>
          </div>
          <DigitalRequestDialog type="dosar-admitere" trigger={<Button>Generează dosar</Button>} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-foreground">Verificabil oficial</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Instituția poate confirma autenticitatea fiecărui document direct prin portal.
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-border p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Acces controlat</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Setează cod de acces și expirare. Revocă oricând accesul cu un singur click.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
