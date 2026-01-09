import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { Menu, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/games", label: "Jeux" },
  { href: "/roadmap", label: "Roadmap" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/90 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/pryzen-logo.png" alt="PRYZEN" className="h-7 w-7" />
          <span className="text-lg font-semibold">PRYZEN</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="gap-1">
              Jouer maintenant <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-6 mt-8">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/pryzen-logo.png" alt="PRYZEN" className="h-7 w-7" />
                  <span className="text-lg font-semibold">PRYZEN</span>
                </div>
              </Link>

              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center p-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-border pt-4 space-y-2">
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Jouer maintenant</Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Connexion
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
