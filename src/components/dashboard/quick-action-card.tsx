import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function QuickActionCard({
  icon: Icon,
  titlu,
  descriere,
  onAction,
}: {
  icon: LucideIcon;
  titlu: string;
  descriere: string;
  onAction?: () => void;
}) {
  return (
    <Card className="group flex flex-col gap-3 border-border p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-serif text-base font-semibold text-foreground">{titlu}</p>
      <p className="text-sm text-muted-foreground">{descriere}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAction}
        className="mt-auto self-start px-2 text-primary hover:bg-accent hover:text-primary"
      >
        Deschide <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </Card>
  );
}
