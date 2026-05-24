import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import {
  downloadProof,
  formatDateTime,
  getRequest,
  type StoredRequest,
} from "@/lib/requests-store";

export const Route = createFileRoute("/_authenticated/dashboard/cereri/$id")({
  head: () => ({ meta: [{ title: "Status cerere — eElev" }] }),
  component: CerereDetaliu,
});

function CerereDetaliu() {
  const { id } = Route.useParams();
  const [req, setReq] = useState<StoredRequest | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReq(getRequest(id));
    setLoaded(true);
  }, [id]);

  if (!loaded) return null;

  if (!req) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/cereri">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Înapoi la cereri
          </Link>
        </Button>
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nu am găsit cererea cu codul <span className="font-mono">{id}</span>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/dashboard/cereri">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Toate cererile
            </Link>
          </Button>
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {req.tipLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cod cerere: <span className="font-mono text-foreground">{req.id}</span>
          </p>
        </div>
        <Button onClick={() => downloadProof(req)}>
          <Download className="mr-1.5 h-4 w-4" /> Descarcă dovada
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rezumat
          </p>
          <Row label="Status">
            <StatusBadge status={req.status} />
          </Row>
          <Row label="Elev" value={req.elevName} />
          <Row label="Școală" value={req.scoala} />
          <Row label="Clasă" value={req.clasa} />
          <Row label="Solicitant" value={req.parentName} />
          <Row label="Rol" value={req.parentRole} />
          <Row label="Instituție destinatară" value={req.institutie} />
          <Row label="Data depunerii" value={formatDateTime(req.createdAt)} />
          {req.documente && req.documente.length > 0 && (
            <div className="pt-2">
              <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                Documente atașate
              </p>
              <ul className="space-y-1 text-sm text-foreground">
                {req.documente.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
            </div>
          )}
          {req.detalii &&
            Object.entries(req.detalii).filter(([, v]) => v && v.trim().length > 0).length > 0 && (
              <div className="pt-2">
                <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                  Detalii cerere
                </p>
                {Object.entries(req.detalii)
                  .filter(([, v]) => v && v.trim().length > 0)
                  .map(([k, v]) => (
                    <Row key={k} label={k} value={v} />
                  ))}
              </div>
            )}
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 border-success/20 bg-success/5 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-foreground">Identitate ROeID</span>
            </div>
            <Badge className="bg-success/15 text-success hover:bg-success/15">
              ROeID verificat
            </Badge>
            <p className="text-xs text-muted-foreground">
              Cererea a fost depusă electronic și confirmată prin identitate verificată ROeID,
              checkbox de acord, marcaj temporal și cod unic de cerere. Toate acțiunile sunt
              înregistrate în jurnalul de audit.
            </p>
          </Card>

          <Card className="space-y-3 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Jurnal audit
            </p>
            <ol className="space-y-3">
              {req.auditLog.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{e.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(e.at)} · {e.actor}
                      {e.method ? ` · ${e.method}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm text-foreground">{children ?? value}</span>
    </div>
  );
}
