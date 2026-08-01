import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import iconAsset from "@/assets/l2r-icon.png.asset.json";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/research", label: "Research" },
  { to: "/pillars", label: "Pillars" },
  { to: "/about", label: "About" },
  { to: "/members", label: "Members" },
] as const;

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-all hover:border-forest hover:text-forest " +
        className
      }
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={iconAsset.url} alt="" className="h-11 w-11" />
          <span className="font-display text-[19px] font-semibold tracking-tight text-foreground">
            L<sup className="text-[12px] text-forest">2</sup> Research
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-forest" }}
              className="font-display text-[13px] font-medium text-foreground/80 transition-colors hover:text-forest"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link to="/apply" className="apply-cta-sm inline-flex">
            Apply <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-all hover:border-forest hover:text-forest"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={
          "md:hidden overflow-hidden border-t border-border bg-background transition-[max-height,opacity] duration-300 ease-out " +
          (open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0")
        }
      >
        <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-forest" }}
              className="border-b border-border/60 py-3 font-display text-[15px] font-medium text-foreground/85 transition-colors hover:text-forest"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/apply"
            onClick={() => setOpen(false)}
            className="apply-cta-sm mt-5 self-start"
          >
            Apply <span aria-hidden>→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}