import { Shield } from "lucide-react";
import { mockUser } from "@/lib/auth";

export function WelcomeSection() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Bun venit,</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {mockUser.prenume} {mockUser.nume}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Gestionează serviciile educaționale digitale pentru copiii asociați contului tău.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
          <Shield className="h-3.5 w-3.5" />
          Autentificat prin ROeID
        </div>
      </div>
    </section>
  );
}
