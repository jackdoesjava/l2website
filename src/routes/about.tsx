import { createFileRoute, Link } from "@tanstack/react-router";
import { QuantCanvas } from "@/components/quant-canvas";
import { usePillars } from "@/lib/site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — L² Research" },
      {
        name: "description",
        content:
          "L² Research is an independent quantitative research group founded at the University of Surrey. Learn what we do, why we exist, and how we operate.",
      },
      { property: "og:title", content: "About — L² Research" },
      {
        property: "og:description",
        content: "What L² Research is, why it exists, and what distinguishes it.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { data: pillars = [] } = usePillars();
  return (
    <>
      {/* Hero — full-bleed fractal */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-ice">
        <QuantCanvas
          variant="fractal"
          className="pointer-events-none absolute inset-0 opacity-95"
        />
        {/* Left-side scrim so text stays crisp against the fractal field */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink)_0%,color-mix(in_srgb,var(--color-ink)_88%,transparent)_38%,color-mix(in_srgb,var(--color-ink)_25%,transparent)_72%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,var(--color-ink)_0%,transparent_100%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-28 lg:px-10 lg:pt-32 lg:pb-36">
          <div className="max-w-3xl">
            <div className="eyebrow flex items-center gap-3 text-ice/70">
              <span className="inline-block h-px w-8 bg-forest" />
              § About · Est. 2026
            </div>
            <h1 className="mt-8 font-display text-[42px] font-light leading-[1.02] tracking-[-0.015em] text-ice sm:text-[60px] lg:text-[80px]">
              A small group,
              <br />
              <span className="font-semibold text-forest">held to one bar</span>.
            </h1>
            <p className="mt-10 max-w-xl font-sans text-[16px] leading-relaxed text-ice/85 lg:text-[18px]">
              L² Research is an independent, student-founded quantitative
              research group. We were built for one purpose: to produce work
              that would defend itself in front of academic and industry
              professionals — and to hold ourselves to that standard, cohort
              after cohort.
            </p>
          </div>
        </div>

        {/* Fact-strip anchored to the bottom of the hero */}
        <div className="relative z-10 border-t border-ice/10 bg-[color-mix(in_srgb,var(--color-ink)_85%,transparent)] backdrop-blur">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 sm:grid-cols-4 lg:px-10">
            {[
              { k: "Founded", v: "2026" },
              { k: "Institution", v: "Surrey" },
              { k: "Pillars", v: String(pillars.length).padStart(2, "0") },
              { k: "Cohort", v: "26 / 27" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="eyebrow text-ice/60">{s.k}</dt>
                <dd className="mt-2 font-display text-[26px] font-light text-ice lg:text-[30px]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:px-10 lg:py-28">
          <div className="lg:col-span-4">
            <div className="eyebrow">§ 01 · The thesis</div>
            <h2 className="mt-5 font-display text-[30px] font-semibold leading-tight tracking-tight text-foreground lg:text-[38px]">
              Why L² exists.
            </h2>
          </div>
          <div className="space-y-6 font-sans text-[16px] leading-relaxed text-foreground/85 lg:col-span-7 lg:col-start-6 lg:text-[17px]">
            <p className="font-display text-[19px] font-light italic text-foreground lg:text-[22px]">
              Most student finance groups optimise for photos, panels and
              prizes. We optimise for one thing — output that a serious reader
              cannot dismiss.
            </p>
            <p>
              We are not a society. We are not a trading club. We do not run
              stock pitch competitions. We publish rigorous, data-driven and
              theoretical work in volatility modelling, mathematical finance
              and statistical methods, and we recruit new analysts each year
              against that single criterion.
            </p>
            <p>
              Every note, working paper and replication is written to be
              technically defensible and self-contained. If it cannot be
              defended in a room of quants, it does not go out under our name.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="flex items-end justify-between border-b border-border pb-6">
            <div className="eyebrow">§ 02 · Principles</div>
            <div className="hidden font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
              Four rules, no exceptions
            </div>
          </div>
          <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Rigour", v: "Real work, held to a professional standard — not a student one. Assumptions are stated, methods are cited, results are reproducible." },
              { k: "Selectivity", v: "Membership is earned. Every analyst is expected to defend their output in front of the group before it ships." },
              { k: "Independence", v: "Not a society, not a networking body. We answer to the work, and we recruit against it — not against social credit." },
              { k: "Restraint", v: "Precision and consistency over visual complexity. Clarity is the aesthetic; the paper does the talking." },
            ].map((it, i) => (
              <div key={it.k} className="border-t border-forest/40 pt-5">
                <div className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-forest">
                  P/{String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 font-display text-[20px] font-semibold text-foreground">{it.k}</div>
                <p className="mt-3 font-sans text-[14px] leading-relaxed text-foreground/75">{it.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work — dark band with second fractal visual */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-ice">
        <QuantCanvas
          variant="fractal"
          className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_15%_50%,black_25%,transparent_75%)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(270deg,var(--color-ink)_0%,color-mix(in_srgb,var(--color-ink)_82%,transparent)_45%,color-mix(in_srgb,var(--color-ink)_35%,transparent)_100%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:px-10 lg:py-28">
          <div className="lg:col-span-5">
            <div className="eyebrow text-ice/70">§ 03 · How we work</div>
            <h2 className="mt-5 font-display text-[28px] font-semibold leading-tight text-ice lg:text-[36px]">
              A single loop, run to completion.
            </h2>
            <p className="mt-6 max-w-md font-sans text-[15px] leading-relaxed text-ice/80 lg:text-[16px]">
              We keep the workflow deliberately narrow. Every piece we publish
              has moved through the same four steps — no shortcuts, no
              exceptions, regardless of who is writing it.
            </p>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {[
              { k: "Frame", v: "A precise question and a hypothesis worth falsifying. Vague topics are turned back at the door." },
              { k: "Model", v: "Assumptions written down. Method chosen for reasons, not familiarity. Data provenance documented." },
              { k: "Defend", v: "Internal review with the pillar lead. Robustness checks, sensitivity, and honest limitations." },
              { k: "Publish", v: "Public working paper or note, with code and data where possible. Failures documented as clearly as wins." },
            ].map((s, i) => (
              <li
                key={s.k}
                className="group grid grid-cols-[64px_1fr] items-start gap-6 border-t border-ice/15 py-6 last:border-b"
              >
                <span className="font-display text-[13px] font-medium uppercase tracking-[0.22em] text-forest">
                  0{i + 1}
                </span>
                <div>
                  <div className="font-display text-[20px] font-semibold text-ice lg:text-[22px]">{s.k}</div>
                  <p className="mt-1.5 font-sans text-[14px] leading-relaxed text-ice/75 lg:text-[15px]">{s.v}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Timeline + Areas */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-12 lg:px-10 lg:py-28">
          <div className="lg:col-span-5">
            <div className="eyebrow">§ 04 · Timeline</div>
            <ol className="mt-8 space-y-6">
              {[
                { t: "Q1 2026", h: "Founding", b: "L² Research is formed at the University of Surrey around a small group of STEM students." },
                { t: "Q2 2026", h: "Four pillars set", b: "Statistical Arbitrage · Derivatives & Volatility · Machine Learning · Market Microstructure." },
                { t: "Q3 2026", h: "First cohort", b: "Recruitment opens for the 2026 / 27 analyst cohort. Selection is against the work, not credentials alone." },
                { t: "Q4 2026", h: "First public papers", b: "Initial working papers and replications published under the group's name." },
              ].map((e) => (
                <li key={e.t} className="grid grid-cols-[110px_1fr] gap-5 border-l-2 border-forest/50 pl-5">
                  <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-forest">{e.t}</span>
                  <div>
                    <div className="font-display text-[16px] font-semibold text-foreground">{e.h}</div>
                    <p className="mt-1 font-sans text-[14px] leading-relaxed text-foreground/75">{e.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="eyebrow">§ 05 · Areas of work</div>
            <ul className="mt-8 divide-y divide-border border-y border-border font-sans text-[16px] text-foreground/85">
              {pillars.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between py-4">
                  <span className="font-display font-medium">{p.title}</span>
                  <span className="font-display text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Pillar {String(i + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans text-[14px] leading-relaxed text-foreground/70">
              Each pillar is led by a member responsible for standards,
              review and the pipeline of work published under that heading.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-end lg:px-10 lg:py-20">
          <p className="max-w-xl font-display text-[24px] font-light leading-snug text-foreground lg:text-[30px]">
            Four pillars. One bar.
            <br />
            <span className="text-forest">Read the work, or apply to join.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/research" className="apply-cta-sm">
              Read the research <span aria-hidden>→</span>
            </Link>
            <Link to="/pillars" className="apply-cta-sm">
              See the pillars <span aria-hidden>→</span>
            </Link>
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 border border-foreground/30 px-4 py-2 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-forest hover:text-forest"
            >
              Apply
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}