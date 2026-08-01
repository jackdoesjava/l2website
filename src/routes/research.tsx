import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { usePapers, type Paper } from "@/lib/site-content";
import { QuantCanvas } from "@/components/quant-canvas";
import { PdfThumb } from "@/components/pdf-thumb";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — L² Research" },
      {
        name: "description",
        content:
          "Papers from L² Research. Peer-reviewed internally, held to institutional standards.",
      },
      { property: "og:title", content: "Research — L² Research" },
      { property: "og:description", content: "Papers from L² Research." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Research,
});

function Research() {
  const { data: papers = [], isLoading } = usePapers();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"curated" | "newest" | "oldest" | "az">("curated");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Paper | null>(null);
  const perPage = 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? papers
      : papers.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.authors.toLowerCase().includes(q) ||
            p.abstract.toLowerCase().includes(q) ||
            p.date_label.toLowerCase().includes(q),
        );
    const list = [...base];
    const yr = (p: Paper) => Number((p.date_label.match(/\d{4}/) ?? ["0"])[0]);
    if (sort === "newest") list.sort((a, b) => yr(b) - yr(a));
    if (sort === "oldest") list.sort((a, b) => yr(a) - yr(b));
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [papers, query, sort]);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  const pageCount = Math.max(1, Math.ceil(rest.length / perPage));
  const current = Math.min(page, pageCount);
  const paged = rest.slice((current - 1) * perPage, current * perPage);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const totalPublished = papers.filter((p) => p.pdf_url).length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-ice">
        <div className="absolute inset-0">
          <QuantCanvas variant="rubik" className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 85% at 2% 45%, color-mix(in oklab, #0A0C0F 92%, transparent) 0%, color-mix(in oklab, #0A0C0F 55%, transparent) 45%, transparent 78%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:px-10 lg:pt-28 lg:pb-32">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="font-sans text-[42px] font-semibold leading-[1.02] tracking-tight text-ice sm:text-[56px] lg:text-[76px]">
                Research, written<br />
                <span className="italic text-ice/85">to be read twice.</span>
              </h1>
              <p className="mt-6 max-w-2xl font-sans text-[15px] leading-relaxed text-ice/70 lg:text-[16px]">
                Papers produced by members of L². Every draft is internally
                peer-reviewed and held to the standard we would use to defend it
                at a desk.
              </p>
            </div>

            <div className="lg:col-span-4">
              <dl className="grid grid-cols-3 gap-4 border-t border-ice/15 pt-6 text-ice">
                {[
                  { k: "Papers", v: String(papers.length).padStart(2, "0") },
                  { k: "Published", v: String(totalPublished).padStart(2, "0") },
                  { k: "Year", v: "'26" },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="font-sans text-[10px] uppercase tracking-[0.24em] text-ice/50">
                      {s.k}
                    </dt>
                    <dd className="mt-2 font-sans text-[28px] font-semibold tabular-nums">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4 lg:px-10">
          <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-muted-foreground tabular-nums">
            {filtered.length.toString().padStart(2, "0")} papers
          </span>
          <div className="flex items-center gap-3">
            <label className="group relative flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 transition-colors focus-within:border-forest lg:w-72">
              <Search size={14} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, author, abstract…"
                className="w-full bg-transparent font-sans text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="text-muted-foreground transition-colors hover:text-forest"
                >
                  <X size={13} />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="Sort papers"
              className="rounded-full border border-border bg-background px-3 py-2 font-sans text-[12px] text-foreground focus:border-forest focus:outline-none"
            >
              <option value="curated">Curated</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">Title A–Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Featured ─────────────────────────────────────────────────── */}
      {featured && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
            <div className="eyebrow mb-6">§ Featured</div>
            <PaperFeatured paper={featured} onOpen={() => setViewing(featured)} />
          </div>
        </section>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <div className="eyebrow">§ Papers</div>
            <span className="font-sans text-[11px] uppercase tracking-[0.24em] text-muted-foreground tabular-nums">
              {rest.length.toString().padStart(2, "0")} entries
            </span>
          </div>

          {isLoading ? (
            <div className="py-24 text-center font-sans text-[13px] text-muted-foreground">
              Loading papers…
            </div>
          ) : !featured ? (
            <div className="py-24 text-center font-sans text-[14px] text-muted-foreground">
              No papers match your search.
            </div>
          ) : rest.length === 0 ? null : (
            <>
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((p) => (
                  <PaperCard key={p.id} paper={p} onOpen={() => setViewing(p)} />
                ))}
              </ul>

              {pageCount > 1 && (
                <nav className="mt-14 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(current - 1)}
                    disabled={current === 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-forest hover:text-forest disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={n === current ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-full border px-3 font-sans text-[12px] tabular-nums transition-colors ${
                        n === current
                          ? "border-forest bg-forest text-ice"
                          : "border-border text-muted-foreground hover:border-forest hover:text-forest"
                      }`}
                    >
                      {n.toString().padStart(2, "0")}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(current + 1)}
                    disabled={current === pageCount}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-forest hover:text-forest disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronRight size={15} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <PdfModal paper={viewing} onClose={() => setViewing(null)} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function PdfModal({ paper, onClose }: { paper: Paper | null; onClose: () => void }) {
  useEffect(() => {
    if (!paper) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [paper, onClose]);

  if (!paper) return null;
  const src = paper.pdf_href ?? paper.pdf_url ?? undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={paper.title}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-sans text-[15px] font-semibold tracking-tight text-foreground">
              {paper.title}
            </h2>
            <p className="mt-1 truncate font-sans text-[12px] text-muted-foreground">
              {paper.authors} · {paper.date_label}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {src && (
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-forest"
              >
                Open <ArrowUpRight size={13} />
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-forest hover:text-forest"
            >
              <X size={15} />
            </button>
          </div>
        </header>
        <div className="flex-1 bg-muted">
          {src ? (
            <iframe src={src} title={paper.title} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center font-sans text-[13px] text-muted-foreground">
              No PDF attached yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaperFeatured({ paper, onOpen }: { paper: Paper; onOpen: () => void }) {
  const has = !!(paper.pdf_href ?? paper.pdf_url);
  return (
    <div
      {...(has ? { role: "button", tabIndex: 0, onClick: onOpen } : {})}
      onKeyDown={(e) => has && e.key === "Enter" && onOpen()}
      className={`group relative block overflow-hidden rounded-sm border border-border bg-card transition-all hover:border-forest ${has ? "cursor-pointer" : ""}`}
    >
      <div className="grid gap-0 lg:grid-cols-12">
        <div className="relative hidden overflow-hidden lg:col-span-5 lg:block">
          <div className="absolute inset-0 bg-ink" />
          <div className="absolute inset-0 opacity-70">
            <QuantCanvas variant="surface" className="h-full w-full" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-card" />
          <div className="relative flex h-full min-h-[280px] items-center justify-center p-8">
            {paper.pdf_href ? (
              <PdfThumb
                url={paper.pdf_href}
                width={260}
                className="aspect-[1/1.294] w-[190px] shadow-lg"
              />
            ) : (
              <div className="font-sans text-[10px] uppercase tracking-[0.28em] text-ice/60">
                Forthcoming
              </div>
            )}
          </div>
        </div>
        <div className="p-8 lg:col-span-7 lg:p-12">
          <div className="mb-4 font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {paper.date_label}
          </div>
          <h2 className="font-sans text-[28px] font-semibold leading-[1.15] tracking-tight text-foreground lg:text-[38px]">
            {paper.title}
          </h2>
          <div className="mt-3 font-sans text-[13px] text-muted-foreground">
            {paper.authors}
          </div>
          <p className="mt-5 max-w-2xl font-sans text-[15px] leading-relaxed text-foreground/85 lg:text-[16px]">
            {paper.abstract}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-forest">
            {has ? "Read PDF" : "Forthcoming"}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaperCard({ paper, onOpen }: { paper: Paper; onOpen: () => void }) {
  const has = !!(paper.pdf_href ?? paper.pdf_url);
  return (
    <li>
      <div
        {...(has ? { role: "button", tabIndex: 0, onClick: onOpen } : {})}
        onKeyDown={(e) => has && e.key === "Enter" && onOpen()}
        className={`group block ${has ? "cursor-pointer" : ""}`}
      >
        <PdfThumb
          url={paper.pdf_href ?? null}
          width={240}
          className="aspect-[1/1.294] w-full transition-all duration-300 group-hover:border-forest group-hover:shadow-md"
        />
        <div className="mt-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {paper.date_label}
          </div>
          <h3 className="mt-2 font-sans text-[16px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-forest">
            {paper.title}
          </h3>
          <div className="mt-1.5 font-sans text-[12px] text-muted-foreground">
            {paper.authors}
          </div>
          <p className="mt-2 line-clamp-3 font-sans text-[13px] leading-relaxed text-foreground/75">
            {paper.abstract}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-forest">
            {has ? "Read PDF" : "Forthcoming"}
            {has && (
              <ArrowUpRight
                size={12}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
          </span>
        </div>
      </div>
    </li>
  );
}
