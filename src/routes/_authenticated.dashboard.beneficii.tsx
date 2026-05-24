import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DigitalRequestDialog } from "@/components/dashboard/digital-request-dialog";
import { CtpFormPrefillDialog } from "@/components/dashboard/ctp-form-prefill-dialog";
import { getBeneficiiPentruElev } from "@/lib/mock-data";
import { useChildren } from "@/lib/children-store";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/beneficii")({
  head: () => ({ meta: [{ title: "Beneficii — eElev" }] }),
  component: Beneficii,
});

function Beneficii() {
  const copii = useChildren();
  const elevActiv = copii[0];
  const beneficii = elevActiv ? getBeneficiiPentruElev(elevActiv) : [];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">Beneficii</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Programe locale și naționale disponibile pentru elevii tăi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {beneficii.map((b) => {
          const eligibil = b.status === "Eligibil";
          return (
            <Card key={b.id} className="flex flex-col gap-3 border-border p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-lg font-semibold text-foreground">{b.titlu}</p>
                  {b.suma && <p className="text-sm text-primary">{b.suma}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>
              <p className="text-sm text-muted-foreground">{b.descriere}</p>
              {eligibil ? (
                b.id === "transport-cluj" ? (
                  <CtpFormPrefillDialog
                    defaultChildId={elevActiv?.id}
                    trigger={
                      <Button size="sm" className="mt-auto self-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Aplică — completat cu AI
                      </Button>
                    }
                  />
                ) : (
                  <DigitalRequestDialog
                    type="beneficiu"
                    contextLabel={b.titlu}
                    trigger={<Button size="sm" className="mt-auto self-start">Aplică digital</Button>}
                  />
                )
              ) : (
                <Button variant="outline" size="sm" className="mt-auto self-start">Vezi detalii</Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
