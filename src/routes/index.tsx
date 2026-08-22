import { createFileRoute, Link } from "@tanstack/react-router";
import { QuantCanvas } from "@/components/quant-canvas";
import { usePillars } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "L² Research — Independent Quantitative Research Group" },
      {
        name: "description",
        content:
          "L² Research is an independent, student-founded quantitative research group at the University of Surrey. Rigorous, selective, restrained.",
      },
      { property: "og:title", content: "L² Research" },
      {
        property: "og:description",
        content: "Independent quantitative research. Rigorous, selective, restrained.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: pillars = [] } = usePillars();
  const pillarCount = pillars.length;
  return (
    <>
      <section id="top" className="relative overflow-hidden border-b border-border bg-ink text-ice">
        <QuantCanvas
          variant="topology"
          className="pointer-events-none absolute inset-0 opacity-90 [mask-image:radial-gradient(ellipse_at_70%_50%,black_35%,transparent_82%)]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_45%,color-mix(in_srgb,var(--color-ink)_92%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_74%,transparent)_45%,color-mix(in_srgb,var(--color-ink)_38%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,var(--color-ink)_0%,transparent_100%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="max-w-4xl">
            <div className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-forest" />
                L² Research · Est. 2026
            </div>
            <h1 className="mt-8 font-display text-[44px] font-light leading-[1.05] text-ice sm:text-[60px] lg:text-[76px]">
              Independent
              <br />
              quantitative research,
              <br />
              held to a <span className="font-semibold text-forest">higher standard</span>.
            </h1>
            <p className="mt-10 max-w-xl font-sans text-[15px] leading-relaxed text-ice/80 lg:text-[17px]">
              A student-founded quantitative research group producing rigorous,
              data-driven and theoretical work in volatility modelling,
              mathematical finance and statistical methods. Membership is earned.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/apply" className="apply-cta">
                Apply <span aria-hidden>→</span>
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-3 border border-ice/60 px-6 py-4 font-display text-[13px] font-medium uppercase tracking-[0.2em] text-ice transition-colors hover:border-forest hover:text-forest"
              >
                Read our research
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-ice/10 pt-8 lg:max-w-xl">
            <Stat
              k={String(pillarCount).padStart(2, "0")}
              v={pillarCount === 1 ? "Research pillar" : "Research pillars"}
            />
            <Stat k="2026" v="Founded" />
            <Stat k="UoS" v="University of Surrey" />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="eyebrow">§ Positioning</div>
              <h2 className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-tight text-foreground lg:text-[34px]">
                What the group is, and is not.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <p className="font-sans text-[16px] leading-relaxed text-foreground/85 lg:text-[18px]">
                We produce quantitative research at a professional standard. We
                are not a trading club. We are not a networking society. Every
                output — a note, a working paper, a replication — is expected
                to be technically defensible and self-contained.
              </p>
              <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {[
                  { k: "Rigour", v: "The work is real and held to a high standard." },
                  { k: "Selectivity", v: "Membership is earned, not assumed." },
                  { k: "Credibility", v: "Worth the attention of industry professionals." },
                  { k: "Restraint", v: "Precision and consistency, not visual complexity." },
                ].map((it) => (
                  <div key={it.k}>
                    <dt className="eyebrow">{it.k}</dt>
                    <dd className="mt-2 font-sans text-[14px] leading-relaxed text-foreground/80">
                      {it.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-ice">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src="/l2r-icon.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 opacity-90"
              />
              <div className="leading-tight">
                <div className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-forest">
                  Recruitment · Open
                </div>
                <div className="mt-1.5 font-display text-[20px] font-semibold text-ice lg:text-[24px]">
                  Applications open for the 2026–27 cohort.
                </div>
              </div>
            </div>
            <Link to="/apply" className="apply-cta">
              Apply now <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="font-display text-[28px] font-light text-ice">
        {k}
      </div>
      <div className="mt-1 font-sans text-[12px] leading-snug text-ice/60">
        {v}
      </div>
    </div>
  );
}