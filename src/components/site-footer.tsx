export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-base font-semibold text-primary">eElev</p>
            <p className="mt-1 text-xs text-muted-foreground">Ministerul Educației și Cercetării</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Str. General Berthelot nr. 28-30,<br />Sector 1, București, 010168
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Contact</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Tel: +40 (0)21 405 62 00</li>
              <li>Email: contact@edu.gov.ro</li>
              <li>Program: L–V, 09:00–17:00</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Resurse</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Termeni și condiții</li>
              <li>Politica de confidențialitate</li>
              <li>Accesibilitate</li>
              <li>ROeID, roeid.ro</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Guvernul României, Ministerul Educației și Cercetării</p>
        </div>
      </div>
    </footer>
  );
}
