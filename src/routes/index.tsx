import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StudentsMarquee } from "@/components/students-marquee";
import { Button } from "@/components/ui/button";
import { RoeidAuthDialog } from "@/components/roeid-auth-dialog";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "eElev, portal național pentru servicii educaționale digitale" },
      {
        name: "description",
        content: "Portal național pentru servicii educaționale digitale. Acces cu ROeID.",
      },
      { property: "og:title", content: "eElev" },
      {
        property: "og:description",
        content: "Portal național pentru servicii educaționale digitale.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="home-hero relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hero-content relative z-10 mx-auto max-w-2xl text-center"
        >
          <h1 className="eelev-wordmark text-7xl text-foreground sm:text-8xl lg:text-9xl">
            <span className="eelev-initial">e</span>Elev
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Portal național pentru servicii educaționale digitale.
          </p>
          <div className="hero-cta mt-8 flex items-center justify-center">
            <AuthCta />
          </div>

        </motion.div>
        <StudentsMarquee />
      </main>
      <SiteFooter />

    </div>
  );
}

function AuthCta() {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  if (user) {
    const to = user.tip === "secretariat" ? "/secretariat" : "/dashboard";
    return (
      <Button size="lg" asChild>
        <Link to={to}>Intră în panou</Link>
      </Button>
    );
  }
  return (
    <RoeidAuthDialog>
      <Button size="lg">Autentificare</Button>
    </RoeidAuthDialog>
  );
}
