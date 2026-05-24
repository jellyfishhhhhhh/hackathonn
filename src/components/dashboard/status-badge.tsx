import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  "Aprobată": "border-success/20 bg-success/10 text-success",
  "Aprobat": "border-success/20 bg-success/10 text-success",
  "Trimisă": "border-primary/20 bg-primary/10 text-primary",
  "În verificare": "border-warning/30 bg-warning/10 text-warning-foreground",
  "Necesită completări": "border-warning/30 bg-warning/15 text-warning-foreground",
  "Necesită actualizare": "border-warning/30 bg-warning/15 text-warning-foreground",
  "Respinsă": "border-destructive/20 bg-destructive/10 text-destructive",
  "Draft": "border-border bg-muted text-muted-foreground",
  "Verificat de școală": "border-success/20 bg-success/10 text-success",
  "În așteptare": "border-warning/30 bg-warning/10 text-warning-foreground",
  "Eligibil": "border-success/20 bg-success/10 text-success",
  "Aplicat": "border-primary/20 bg-primary/10 text-primary",
  "Neeligibil pentru clasa curentă": "border-border bg-muted text-muted-foreground",
  "Asociere confirmată": "border-success/20 bg-success/10 text-success",
  "Activ": "border-success/20 bg-success/10 text-success",
  "Confirmat": "border-success/20 bg-success/10 text-success",
  "Respins": "border-destructive/20 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(map[status] ?? "border-border bg-muted text-muted-foreground", className)}>
      {status}
    </Badge>
  );
}
