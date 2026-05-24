import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  asocieriDePerfectat,
  inscrieriNoi,
  transferuriPlecari,
  type TransferPlecare,
} from "@/lib/mock-data";
import { Check, X, Info, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/secretariat/asocieri")({
  head: () => ({ meta: [{ title: "Evidență elevi — Secretariat" }] }),
  component: EvidentaElevi,
});

type RowState = "pending" | "confirmat" | "respins" | "completari";

function EvidentaElevi() {
  const [inscrieriState, setInscrieriState] = useState<Record<string, RowState>>({});
  const [transferState, setTransferState] = useState<Record<string, RowState>>({});
  const [asocieriState, setAsocieriState] = useState<Record<string, RowState>>({});

  const [completariOpen, setCompletariOpen] = useState(false);
  const [completariRow, setCompletariRow] = useState<TransferPlecare | null>(null);
  const [completariMesaj, setCompletariMesaj] = useState("");

  function statusFor(rowState: RowState | undefined, fallback: string) {
    if (rowState === "confirmat") return "Confirmat";
    if (rowState === "respins") return "Respins";
    if (rowState === "completari") return "Necesită completări";
    return fallback;
  }

  function openCompletari(row: TransferPlecare) {
    setCompletariRow(row);
    setCompletariMesaj("");
    setCompletariOpen(true);
  }

  function trimiteCompletari() {
    if (completariRow) {
      setTransferState((s) => ({ ...s, [completariRow.id]: "completari" }));
    }
    setCompletariOpen(false);
    toast.success("Solicitare de completări trimisă.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Evidență elevi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestionează solicitările de înscriere, transfer și asociere pentru elevii Liceului Teoretic Onisifor Ghibu.
        </p>
      </div>

      <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Secretariatul confirmă doar datele aflate în evidența școlii. Relația legală părinte-copil poate necesita
          documente justificative sau verificări suplimentare.
        </p>
      </div>

      <Tabs defaultValue="inscrieri" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inscrieri">Înscrieri noi</TabsTrigger>
          <TabsTrigger value="transferuri">Transferuri / plecări</TabsTrigger>
          <TabsTrigger value="asocieri">Asocieri părinte-copil</TabsTrigger>
        </TabsList>

        {/* Tab 1 — Înscrieri noi */}
        <TabsContent value="inscrieri">
          <Card className="border-border p-0 shadow-soft">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Părinte / tutore</TableHead>
                    <TableHead>Elev</TableHead>
                    <TableHead>CNP elev</TableHead>
                    <TableHead>Clasa</TableHead>
                    <TableHead>Data solicitării</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acțiune</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscrieriNoi.map((r) => {
                    const st = inscrieriState[r.id];
                    const done = st === "confirmat" || st === "respins";
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.parinte}</TableCell>
                        <TableCell>{r.elev}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{r.cnpElev}</TableCell>
                        <TableCell>{r.clasa}</TableCell>
                        <TableCell className="text-muted-foreground">{r.data}</TableCell>
                        <TableCell>
                          <StatusBadge status={statusFor(st, "În așteptare")} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={done}
                              onClick={() => {
                                setInscrieriState((s) => ({ ...s, [r.id]: "respins" }));
                                toast.error("Solicitarea a fost respinsă.");
                              }}
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" /> Respinge
                            </Button>
                            <Button
                              size="sm"
                              disabled={done}
                              onClick={() => {
                                setInscrieriState((s) => ({ ...s, [r.id]: "confirmat" }));
                                toast.success("Înscriere confirmată.");
                              }}
                            >
                              <Check className="mr-1.5 h-3.5 w-3.5" /> Confirmă înscrierea
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2 — Transferuri / plecări */}
        <TabsContent value="transferuri">
          <Card className="border-border p-0 shadow-soft">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Elev</TableHead>
                    <TableHead>Clasa</TableHead>
                    <TableHead>Părinte / tutore</TableHead>
                    <TableHead>Motiv</TableHead>
                    <TableHead>Instituție destinatară</TableHead>
                    <TableHead>Data solicitării</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acțiune</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferuriPlecari.map((r) => {
                    const st = transferState[r.id];
                    const done = st === "confirmat" || st === "respins";
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.elev}</TableCell>
                        <TableCell>{r.clasa}</TableCell>
                        <TableCell>{r.parinte}</TableCell>
                        <TableCell>{r.motiv}</TableCell>
                        <TableCell className="text-muted-foreground">{r.institutieDestinatara ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{r.data}</TableCell>
                        <TableCell>
                          <StatusBadge status={statusFor(st, r.status)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={done}
                              onClick={() => {
                                setTransferState((s) => ({ ...s, [r.id]: "respins" }));
                                toast.error("Solicitarea a fost respinsă.");
                              }}
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" /> Respinge
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={done}
                              onClick={() => openCompletari(r)}
                            >
                              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Cere completări
                            </Button>
                            <Button
                              size="sm"
                              disabled={done}
                              onClick={() => {
                                setTransferState((s) => ({ ...s, [r.id]: "confirmat" }));
                                if (r.motiv === "Transfer") {
                                  toast.success("Transferul a fost aprobat.");
                                } else {
                                  toast.success("Plecarea a fost confirmată.");
                                }
                              }}
                            >
                              <Check className="mr-1.5 h-3.5 w-3.5" />
                              {r.motiv === "Transfer" ? "Aprobă transfer" : "Confirmă plecarea"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3 — Asocieri părinte-copil */}
        <TabsContent value="asocieri">
          <Card className="border-border p-0 shadow-soft">
            <div className="border-b border-border p-4">
              <p className="text-sm text-muted-foreground">
                Confirmă că elevul este înscris la această unitate de învățământ și că solicitantul poate gestiona
                cererile pentru elev.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Părinte / tutore</TableHead>
                    <TableHead>Elev</TableHead>
                    <TableHead>CNP elev</TableHead>
                    <TableHead>Clasa</TableHead>
                    <TableHead>Data solicitării</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acțiune</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asocieriDePerfectat.map((a) => {
                    const st = asocieriState[a.id];
                    const done = st === "confirmat" || st === "respins";
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.parinte}</TableCell>
                        <TableCell>{a.elev}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{a.cnpElev}</TableCell>
                        <TableCell>{a.clasa}</TableCell>
                        <TableCell className="text-muted-foreground">{a.data}</TableCell>
                        <TableCell>
                          <StatusBadge status={statusFor(st, "În așteptare")} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={done}
                              onClick={() => {
                                setAsocieriState((s) => ({ ...s, [a.id]: "respins" }));
                                toast.error("Asociere respinsă.");
                              }}
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" /> Respinge
                            </Button>
                            <Button
                              size="sm"
                              disabled={done}
                              onClick={() => {
                                setAsocieriState((s) => ({ ...s, [a.id]: "confirmat" }));
                                toast.success("Asociere confirmată.");
                              }}
                            >
                              <Check className="mr-1.5 h-3.5 w-3.5" /> Confirmă asocierea
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={completariOpen} onOpenChange={setCompletariOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cere completări</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="mesaj-completari">Mesaj către părinte/tutore</Label>
            <Textarea
              id="mesaj-completari"
              rows={5}
              value={completariMesaj}
              onChange={(e) => setCompletariMesaj(e.target.value)}
              placeholder="Descrie ce documente sau informații lipsesc..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletariOpen(false)}>
              Anulează
            </Button>
            <Button onClick={trimiteCompletari} disabled={!completariMesaj.trim()}>
              Trimite solicitarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
