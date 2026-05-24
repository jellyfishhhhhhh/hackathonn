import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { documenteImportante } from "@/lib/mock-data";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/documente")({
  head: () => ({ meta: [{ title: "Documente — eElev" }] }),
  component: Documente,
});

function Documente() {
  const groups = ["Istoric", "Diplomă", "Voluntariat", "Adeverință"] as const;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">Documente</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Documentele educaționale pentru elevii asociați contului tău.
        </p>
      </div>

      {groups.map((g) => {
        const items = documenteImportante.filter((d) => d.categorie === g);
        if (!items.length) return null;
        return (
          <section key={g} className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-foreground">{g}</h2>
            <Card className="border-border p-0 shadow-soft">
              <div className="divide-y divide-border">
                {items.map((d) => (
                  <div key={d.id} className="flex items-center gap-4 p-4">
                    <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-accent text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{d.titlu}</p>
                      <p className="text-xs text-muted-foreground">{d.data}</p>
                    </div>
                    <StatusBadge status={d.status} />
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-3.5 w-3.5" /> Descarcă
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
