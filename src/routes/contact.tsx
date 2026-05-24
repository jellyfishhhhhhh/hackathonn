import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — eElev" }] }),
  component: Contact,
});

function Contact() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">Contact</h1>
          <p className="mt-3 text-muted-foreground">
            Ministerul Educației și Cercetării — Direcția Generală pentru Digitalizare.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, label: "Adresă", value: "Str. General Berthelot 28-30, București" },
              { icon: Phone, label: "Telefon", value: "+40 (0)21 405 62 00" },
              { icon: Mail, label: "Email", value: "contact@edu.gov.ro" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <c.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
