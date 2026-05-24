import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldCheck,
  UserX,
  ArrowRight,
  Users,
  Mail,
  Home,
} from "lucide-react";
import {
  getLookupChildren,
  getScenario,
  setScenario,
  setChildrenList,
  setActiveChildId,
  type LookupScenario,
} from "@/lib/children-store";
import { getUser, logout, mockUser } from "@/lib/auth";

export const Route = createFileRoute("/asociere-copii")({
  head: () => ({ meta: [{ title: "Asociere copii — eElev" }] }),
  component: AsociereCopii,
});

function AsociereCopii() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scenario, setS] = useState<LookupScenario>("one");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getUser()) {
      navigate({ to: "/" });
      return;
    }
    const sc = getScenario();
    setS(sc);
    const children = getLookupChildren(sc);
    setChildrenList(children);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [navigate]);

  const children = getLookupChildren(scenario);

  // Auto-redirect when exactly 1 child
  useEffect(() => {
    if (loading) return;
    if (scenario === "one" && children.length === 1) {
      setActiveChildId(children[0].id);
      const t = setTimeout(() => navigate({ to: "/dashboard" }), 1400);
      return () => clearTimeout(t);
    }
  }, [loading, scenario, children, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/30 via-background to-background px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <ShieldCheck className="h-4 w-4" />
          Autentificat ca {mockUser.prenume} {mockUser.nume} · părinte / tutore
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingCard key="loading" />
          ) : children.length === 0 ? (
            <ZeroCard key="zero" />
          ) : children.length === 1 ? (
            <SingleCard key="single" copil={children[0]} onContinue={() => navigate({ to: "/dashboard" })} />
          ) : (
            <MultiCard
              key="multi"
              copii={children}
              onSelect={(id) => {
                setActiveChildId(id);
                navigate({ to: "/dashboard" });
              }}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <Card className="flex flex-col items-center gap-4 border-border p-10 text-center shadow-soft">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <p className="font-serif text-xl font-semibold text-foreground">
            Verificăm CNP-ul tău în registrele școlilor înscrise în eElev…
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Identificăm elevii care te au înregistrat ca părinte sau tutore legal.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function ZeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <Card className="border-border p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <UserX className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">
          Nu am găsit niciun elev asociat CNP-ului tău
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Școala este sursa oficială a relației părinte-copil. Dacă elevul tău este înscris,
          contactează secretariatul pentru a verifica datele din dosar.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild>
            <a href="mailto:secretariat@scoala.ro?subject=Asociere%20parinte%20eElev">
              <Mail className="mr-2 h-4 w-4" /> Contactează școala
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            <Home className="mr-2 h-4 w-4" /> Înapoi la pagina principală
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function SingleCard({ copil, onContinue }: { copil: { id: string; prenume: string; nume: string; clasa: string; scoala: string }; onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <Card className="border-border p-8 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground">
          Te-am identificat ca părinte al lui {copil.prenume} {copil.nume}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {copil.clasa} · {copil.scoala}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Te redirecționăm către panou…</p>
        <Button className="mt-6" onClick={onContinue}>
          Continuă acum <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </motion.div>
  );
}

function MultiCard({
  copii,
  onSelect,
}: {
  copii: Array<{ id: string; prenume: string; nume: string; clasa: string; scoala: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <Card className="border-border p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              Bună, {mockUser.prenume}! Vezi situația cui?
            </h1>
            <p className="text-sm text-muted-foreground">
              Ai mai mulți elevi asociați. Alege cu cine vrei să începi — poți schimba oricând din panou.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {copii.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-accent/30 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-serif text-lg font-semibold text-primary-foreground">
                {c.prenume[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{c.prenume} {c.nume}</p>
                <p className="truncate text-xs text-muted-foreground">{c.clasa} · {c.scoala}</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function ScenarioSwitcher({ current, onChange }: { current: LookupScenario; onChange: (s: LookupScenario) => void }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
      <span className="uppercase tracking-wider">Demo:</span>
      {(["zero", "one", "multi"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded-full border px-2.5 py-0.5 transition-colors ${
            current === s
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border hover:border-primary/30 hover:text-foreground"
          }`}
        >
          {s === "zero" ? "0 copii" : s === "one" ? "1 copil" : "mai mulți copii"}
        </button>
      ))}
    </div>
  );
}
