import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { inboxSecretariat } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/secretariat/")({
  head: () => ({ meta: [{ title: "Inbox cereri — Secretariat" }] }),
  component: Inbox,
});

function Inbox() {
  return (
    <div className="space-y-4">
      <Card className="flex gap-3 border-primary/20 bg-primary/5 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ClipboardList className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          Cererile primite de la părinți și elevi majori.
        </p>
      </Card>

      <Card className="border-border p-0 shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cod cerere</TableHead>
                <TableHead>Tip cerere</TableHead>
                <TableHead>Elev</TableHead>
                <TableHead>Clasă</TableHead>
                <TableHead>Solicitant</TableHead>
                <TableHead>Data trimiterii</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiune</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inboxSecretariat.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-foreground">{c.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{c.tip}</TableCell>
                  <TableCell>{c.elev}</TableCell>
                  <TableCell className="text-muted-foreground">{c.clasa}</TableCell>
                  <TableCell className="text-muted-foreground">{c.solicitant}</TableCell>
                  <TableCell className="text-muted-foreground">{c.data}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                      <Link to="/secretariat/cerere/$id" params={{ id: c.id }}>Vezi detalii</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
