import { Link } from "@tanstack/react-router";

const nav: { label: string; to: string }[] = [
  { label: "Research", to: "/research" },
  { label: "Pillars", to: "/pillars" },
  { label: "About", to: "/about" },
  { label: "Members", to: "/members" },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-ink text-ice">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-forest/70 to-transparent"
      />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row lg:px-10">
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-display text-[11px] uppercase tracking-[0.2em] text-ice/80"
        >
          {nav.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="transition-colors hover:text-forest"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 font-display text-[10px] uppercase tracking-[0.22em] text-[#8A9AAA]">
          <span>© 2026 L² Research</span>
          <span aria-hidden className="h-3 w-px bg-white/10" />
          <Link to="/admin" className="transition-colors hover:text-forest">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
