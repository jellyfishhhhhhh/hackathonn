import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, Settings, type LucideIcon } from "lucide-react";
import logo from "@/assets/logo-mec.png";
import { getUser, logout, type MockUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const parinteNav: { to: string; label: string; icon?: LucideIcon }[] = [
  { to: "/dashboard", label: "Panou" },
  { to: "/dashboard/cereri", label: "Cereri" },
  { to: "/dashboard/documente", label: "Documente" },
  { to: "/dashboard/beneficii", label: "Beneficii" },
  { to: "/dashboard/admitere", label: "Admitere" },
  { to: "/dashboard/setari", label: "Setări", icon: Settings },
];

const secretariatNav: { to: string; label: string; icon?: LucideIcon }[] = [
  { to: "/secretariat", label: "Inbox cereri" },
  { to: "/secretariat/asocieri", label: "Asocieri" },
];

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  const authed = !!user;
  const privateNav = user?.tip === "secretariat" ? secretariatNav : parinteNav;

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Ministerul Educației și Cercetării" className="h-10 w-auto sm:h-12" />
        </Link>

        {authed && (
          <nav className="hidden items-center gap-1 md:flex">
            {privateNav.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                    {item.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-gradient-to-r from-primary via-primary to-primary/70"
                      transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.9 }}
                      style={{ originY: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {authed && (
          <>
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Ieșire
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Meniu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-8 flex flex-col gap-1">
                  {privateNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      {item.icon ? <item.icon className="h-4 w-4" /> : null}
                      {item.label}
                    </Link>
                  ))}
                  <div className="mt-4 border-t border-border pt-4">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      Ieșire
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </header>
  );
}
