import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { RoeidAuthDialog } from "@/components/roeid-auth-dialog";

export const Route = createFileRoute("/despre")({
  head: () => ({ meta: [{ title: "Despre eElev" }] }),
  component: Despre,
});

function Despre() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground">
            Despre eElev
          </h1>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              eElev este un portal pentru servicii educaționale digitale, destinat elevilor,
              părinților, tutorilor legali și unităților de învățământ.
            </p>
            <p>
              Platforma permite gestionarea cererilor școlare, documentelor educaționale,
              beneficiilor locale și dosarelor pentru înscriere sau admitere.
            </p>
            <p>
              Accesul se face pe baza identității digitale, iar datele elevilor sunt afișate
              doar utilizatorilor autorizați.
            </p>
          </div>
          <div className="mt-10">
            <RoeidAuthDialog>
              <Button size="lg">Autentificare cu ROeID</Button>
            </RoeidAuthDialog>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
