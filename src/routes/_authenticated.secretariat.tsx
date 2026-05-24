import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/secretariat")({
  head: () => ({ meta: [{ title: "Secretariat — eElev" }] }),
  component: SecretariatLayout,
});

const tabs = [
  { to: "/secretariat", label: "Inbox cereri", exact: true },
  { to: "/secretariat/servicii", label: "Servicii școlare" },
  { to: "/secretariat/asocieri", label: "Evidență elevi" },
];

function SecretariatLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">Secretariat</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Liceul Teoretic Onisifor Ghibu — Cluj-Napoca
            </p>
          </div>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-border">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
