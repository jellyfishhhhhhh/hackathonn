import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Bell,
  Check,
  IdCard,
  Lock,
  Loader2,
  Mail,
  School,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { login } from "@/lib/auth";
import roeidLogo from "@/assets/roeid-logo.png";

export const Route = createFileRoute("/sso/roeid")({
  head: () => ({
    meta: [
      { title: "ROeID — Autentificare" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SsoRoeidPage,
});

type Stage = "credentials" | "push" | "consent" | "callback";


const scopes = [
  { icon: User, label: "Nume și prenume" },
  { icon: IdCard, label: "Cod numeric personal (CNP)" },
  { icon: Mail, label: "Adresă de e-mail" },
  { icon: School, label: "Instituția de învățământ și rol" },
];

const stepAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: "easeOut" as const },
};

function SsoRoeidPage() {
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState("");

  const normalizedEmail = email.trim().toLowerCase();
  const isSecretariat =
    normalizedEmail === "secretariat@gmail.com" ||
    normalizedEmail.startsWith("secretariat@") ||
    /@scoala\.ro$/i.test(normalizedEmail);

  return (
    <div className="flex min-h-screen flex-col bg-[oklch(0.96_0.01_245)]">
      {/* Fake browser chrome */}
      <div className="border-b border-[oklch(0.88_0.01_240)] bg-[oklch(0.99_0.005_240)]">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.18_25)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.8_0.15_85)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.15_150)]" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-md border border-[oklch(0.9_0.01_240)] bg-white px-3 py-1.5 text-xs text-[oklch(0.35_0.02_240)]">
            <Lock className="h-3 w-3 text-[oklch(0.55_0.14_155)]" />
            <span className="font-mono">https://sso.roeid.ro/autorizare</span>
          </div>
          <span className="hidden text-[10px] uppercase tracking-wider text-[oklch(0.5_0.02_240)] sm:inline">
            Conexiune securizată
          </span>
        </div>
      </div>

      {/* Gov header */}
      <header className="border-b border-[oklch(0.9_0.01_240)] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-[oklch(0.9_0.01_240)]">
              <img src={roeidLogo} alt="ROeID" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-[oklch(0.2_0.08_245)]">
                ROeID
              </p>
              <p className="text-[10px] uppercase tracking-wider text-[oklch(0.5_0.02_240)]">
                Identitate digitală · Guvernul României
              </p>
            </div>
          </div>
          <div aria-hidden className="flex h-5 overflow-hidden rounded-sm border border-[oklch(0.9_0.01_240)]">
            <span className="w-2 bg-[oklch(0.35_0.2_260)]" />
            <span className="w-2 bg-[oklch(0.95_0.05_85)]" />
            <span className="w-2 bg-[oklch(0.55_0.2_25)]" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-[oklch(0.9_0.01_240)] bg-white p-6 shadow-[0_10px_40px_-20px_oklch(0.3_0.1_245/0.25)]">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-[oklch(0.5_0.14_245)]">
              Autorizare aplicație
            </p>
            <span className="rounded-full border border-[oklch(0.9_0.01_240)] bg-[oklch(0.98_0.01_245)] px-2 py-0.5 text-[10px] text-[oklch(0.4_0.05_240)]">
              eElev
            </span>
          </div>

          <AnimatePresence mode="wait">
            {stage === "credentials" && (
              <CredentialsStage
                key="credentials"
                email={email}
                setEmail={setEmail}
                onNext={() => setStage("push")}
              />
            )}
            {stage === "push" && (
              <PushStage
                key="push"
                onApprove={() => setStage("consent")}
                onReject={() => {
                  toast.error("Cerere respinsă din aplicația ROeID");
                  setStage("credentials");
                }}
              />
            )}
            {stage === "consent" && (
              <ConsentStage
                key="consent"
                onAuthorize={() => setStage("callback")}
                onRefuse={() => {
                  toast.error("Autentificare anulată", {
                    description: "Nu ai acordat consimțământul pentru transferul datelor.",
                  });
                  setStage("credentials");
                }}
              />
            )}
            {stage === "callback" && (
              <CallbackStage key="callback" isSecretariat={isSecretariat} />
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-[oklch(0.9_0.01_240)] bg-white py-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-2 px-6 text-[11px] text-[oklch(0.5_0.02_240)] sm:flex-row">
          <p>© Guvernul României · Autoritatea pentru Digitalizarea României</p>
          <Link to="/" className="hover:text-[oklch(0.35_0.18_245)] hover:underline">
            Anulează și revino la eElev
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CredentialsStage({
  email,
  setEmail,
  onNext,
}: {
  email: string;
  setEmail: (v: string) => void;
  onNext: () => void;
}) {
  const [parola, setParola] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Introdu o adresă de e-mail validă.");
      return;
    }
    if (parola.length < 1) {
      setErr("Introdu parola ROeID.");
      return;
    }
    setErr("");
    onNext();
  };


  return (
    <motion.div {...stepAnim}>
      <h1 className="font-serif text-2xl font-semibold text-[oklch(0.2_0.08_245)]">
        Conectare la ROeID
      </h1>
      <p className="mt-1.5 text-sm text-[oklch(0.45_0.02_240)]">
        <span className="font-medium text-[oklch(0.25_0.12_245)]">eElev</span> îți cere să-ți
        confirmi identitatea.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="nume.prenume@exemplu.ro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parola">Parolă ROeID</Label>
          <Input
            id="parola"
            type="password"
            placeholder="••••••••"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />
          <p className="text-[11px] leading-relaxed text-[oklch(0.5_0.02_240)]">
            Aceasta este parola ta unică ROeID, validă pentru toate serviciile statului. Nu
            este parola eElev.
          </p>
        </div>

        {err && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {err}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[oklch(0.3_0.18_245)] hover:bg-[oklch(0.25_0.18_245)]"
          size="lg"
        >
          Continuă <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>


      <div className="mt-5 border-t border-[oklch(0.92_0.01_240)] pt-3 text-center text-xs text-[oklch(0.5_0.02_240)]">
        Ai uitat parola? ·{" "}
        <span className="text-[oklch(0.4_0.16_245)]">Înregistrează un cont ROeID</span>
      </div>
    </motion.div>
  );
}


function PushStage({
  onApprove,
  onReject,
}: {
  onApprove: () => void;
  onReject: () => void;
}) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <motion.div {...stepAnim}>
      <h1 className="font-serif text-2xl font-semibold text-[oklch(0.2_0.08_245)]">
        Confirmă din aplicația ROeID
      </h1>
      <p className="mt-1.5 text-sm text-[oklch(0.45_0.02_240)]">
        Am trimis o notificare pe telefonul tău. Deschide aplicația{" "}
        <span className="font-medium text-[oklch(0.25_0.12_245)]">ROeID</span> și apasă{" "}
        <span className="font-medium">Aprob</span>.
      </p>

      <div className="relative mx-auto mt-6 flex h-28 w-28 items-center justify-center">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute h-16 w-16 rounded-full bg-[oklch(0.3_0.18_245)]/20"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.75, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute h-16 w-16 rounded-full bg-[oklch(0.3_0.18_245)]/20"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.75, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.3_0.18_245)] text-white shadow-lg">
          <Smartphone className="h-8 w-8" />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-[oklch(0.92_0.01_240)] bg-[oklch(0.98_0.005_240)] p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-[oklch(0.9_0.01_240)]">
            <img src={roeidLogo} alt="ROeID" className="h-7 w-7 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.4_0.02_240)]">
                ROeID
              </p>
              <span className="text-[10px] text-[oklch(0.5_0.02_240)]">acum</span>
            </div>
            <p className="mt-0.5 text-sm font-medium text-[oklch(0.2_0.08_245)]">
              Cerere de autentificare
            </p>
            <p className="text-xs text-[oklch(0.45_0.02_240)]">
              eElev dorește să acceseze identitatea ta.
            </p>
          </div>
          <Bell className="h-3.5 w-3.5 flex-none text-[oklch(0.5_0.02_240)]" />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onReject}>
          Respinge
        </Button>
        <Button
          className="flex-1 bg-[oklch(0.3_0.18_245)] hover:bg-[oklch(0.25_0.18_245)]"
          onClick={onApprove}
          disabled={seconds <= 0}
        >
          Am aprobat din telefon
        </Button>
      </div>

      <div className="mt-3 text-center text-xs text-[oklch(0.5_0.02_240)]">
        {seconds > 0 ? (
          <>Cererea expiră în {seconds}s</>
        ) : (
          <button
            type="button"
            onClick={() => setSeconds(60)}
            className="font-medium text-[oklch(0.4_0.16_245)] hover:underline"
          >
            Trimite o cerere nouă
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ConsentStage({
  onAuthorize,
  onRefuse,
}: {
  onAuthorize: () => void;
  onRefuse: () => void;
}) {
  return (
    <motion.div {...stepAnim}>
      <h1 className="font-serif text-2xl font-semibold text-[oklch(0.2_0.08_245)]">
        Autorizezi accesul?
      </h1>
      <p className="mt-1.5 text-sm text-[oklch(0.45_0.02_240)]">
        <span className="font-medium text-[oklch(0.25_0.12_245)]">eElev</span> dorește să
        acceseze următoarele date:
      </p>

      <ul className="mt-4 space-y-1.5 border-t border-[oklch(0.92_0.01_240)] pt-3">
        {scopes.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-2.5 px-1 py-1 text-sm text-[oklch(0.25_0.05_240)]"
          >
            <s.icon className="h-3.5 w-3.5 flex-none text-[oklch(0.5_0.1_245)]" />
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-[oklch(0.5_0.02_240)]">
        Conform GDPR Art. 8 și legislației române, acordul pentru procesarea datelor elevilor
        minori aparține părintelui sau tutorelui legal. Poți revoca consimțământul oricând din
        setările contului ROeID.
      </p>

      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onRefuse}>
          Refuză
        </Button>
        <Button
          className="flex-1 bg-[oklch(0.3_0.18_245)] hover:bg-[oklch(0.25_0.18_245)]"
          onClick={onAuthorize}
        >
          Autorizează
        </Button>
      </div>
    </motion.div>
  );
}

function CallbackStage({ isSecretariat }: { isSecretariat: boolean }) {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const codeRef = useRef("mock_" + Math.random().toString(36).slice(2, 10));

  useEffect(() => {
    const target = isSecretariat ? "/secretariat" : "/asociere-copii";
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(() => {
      login(isSecretariat ? "secretariat" : "parinte");
      setDone(true);
      redirectTimer = setTimeout(() => navigate({ to: target, replace: true }), 450);
    }, 700);

    return () => {
      clearTimeout(t);
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isSecretariat]);

  return (
    <motion.div {...stepAnim} className="py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center">
        {done ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.65_0.18_155)] text-white"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.95_0.04_245)] text-[oklch(0.3_0.18_245)]">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        )}
      </div>
      <h1 className="mt-5 font-serif text-xl font-semibold text-[oklch(0.2_0.08_245)]">
        {done ? "Autentificare reușită" : "Se redirecționează către eElev…"}
      </h1>
      <p className="mt-1.5 text-sm text-[oklch(0.45_0.02_240)]">
        {done
          ? isSecretariat
            ? "Te ducem în panoul de secretariat…"
            : "Căutăm elevii asociați identității tale…"
          : "Schimbăm codul de autorizare cu un token de acces."}
      </p>
      <p className="mt-4 break-all rounded-md border border-[oklch(0.92_0.01_240)] bg-[oklch(0.98_0.005_240)] px-3 py-2 text-left font-mono text-[10px] text-[oklch(0.45_0.02_240)]">
        https://e-elev.online/auth/roeid/callback?code={codeRef.current}
      </p>
    </motion.div>
  );
}
