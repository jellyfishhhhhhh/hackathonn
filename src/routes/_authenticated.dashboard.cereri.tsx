import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DigitalRequestDialog, type RequestType } from "@/components/dashboard/digital-request-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Download, ChevronDown } from "lucide-react";
import { cereriRecente } from "@/lib/mock-data";
import { downloadProof, formatDateTime, useRequests } from "@/lib/requests-store";

export const Route = createFileRoute("/_authenticated/dashboard/cereri")({
  head: () => ({ meta: [{ title: "Cereri — eElev" }] }),
  component: Cereri,
});

const TIP_OPTIONS: { value: RequestType; label: string }[] = [
  { value: "adeverinta", label: "Adeverință elev" },
  { value: "scutire-medicala", label: "Scutire medicală" },
  { value: "invoire", label: "Învoire" },
];

function Cereri() {
  const myRequests = useRequests();
  const [activeType, setActiveType] = useState<RequestType | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">Cereri</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Toate cererile depuse către instituții, pentru elevii asociați contului tău.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Cerere nouă
              <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TIP_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.value} onSelect={() => setActiveType(opt.value)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeType && (
          <DigitalRequestDialog
            key={activeType}
            type={activeType}
            open={true}
            onOpenChange={(o) => {
              if (!o) setActiveType(null);
            }}
          />
        )}
      </div>

      {myRequests.length > 0 && (
        <Card className="border-border p-0 shadow-soft">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg text-foreground">Depuse electronic</h2>
            <p className="text-xs text-muted-foreground">
              Cereri înregistrate cu identitate ROeID, accesibile pentru status și dovadă.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cod</TableHead>
                  <TableHead>Tip cerere</TableHead>
                  <TableHead className="hidden md:table-cell">Elev</TableHead>
                  <TableHead className="hidden sm:table-cell">Depusă</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-foreground">{r.id}</TableCell>
                    <TableCell className="font-medium text-foreground">{r.tipLabel}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {r.elevName}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDateTime(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadProof(r)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Dovadă
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
                        <Link to="/dashboard/cereri/$id" params={{ id: r.id }}>
                          Status
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Card className="border-border p-0 shadow-soft">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-serif text-lg text-foreground">Istoric</h2>
          <p className="text-xs text-muted-foreground">
            Cereri anterioare către instituții partenere.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip cerere</TableHead>
                <TableHead>Elev</TableHead>
                <TableHead className="hidden md:table-cell">Instituție</TableHead>
                <TableHead className="hidden sm:table-cell">Data trimiterii</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiune</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cereriRecente.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.tip}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.elev}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {c.institutie}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {c.data}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      {c.status === "Aprobată" ? (
                        <>
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Descarcă
                        </>
                      ) : c.status === "Necesită completări" ? (
                        "Completează"
                      ) : (
                        "Vezi detalii"
                      )}
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
