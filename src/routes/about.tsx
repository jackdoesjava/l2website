import { createFileRoute, Link } from "@tanstack/react-router";
import { QuantCanvas } from "@/components/quant-canvas";
import { usePillars } from "@/lib/site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · L² Research" },
      {
        name: "description",
        content:
          "L² Research is an independent research pod working across quantitative finance, low-level systems engineering and machine learning. What we do, why we exist, and how we operate.",
      },
      { property: "og:title", content: "About · L² Research" },
      {
        property: "og:description",
        content: "What L² Research is, why it exists, and the bar it holds.",
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
              L² Research is an independent research pod based in the UK. We
              work across quantitative finance, low-level systems engineering
              and machine learning. Everything we ship is built to defend
              itself in front of industry professionals, and every member is
              held to that.
            </p>
          </div>
        </div>

        {/* Fact-strip anchored to the bottom of the hero */}
        <div className="relative z-10 border-t border-ice/10 bg-[color-mix(in_srgb,var(--color-ink)_85%,transparent)] backdrop-blur">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 sm:grid-cols-4 lg:px-10">
            {[
              { k: "Established", v: "2026" },
              { k: "Base", v: "UK" },
              { k: "Pillars", v: String(pillars.length).padStart(2, "0") },
              { k: "Intake", v: "Open" },
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
              Most groups optimise for signalling: panels, prizes, a logo on
              a slide. We optimise for one thing: output a serious reader
              cannot dismiss.
            </p>
            <p>
              We are not a trading club. We do not run pitch competitions. We
              build and we publish. Two pillars carry the work. Under research
              engineering, topics such as bare-metal systems, low-latency
              infrastructure, high-performance computing and machine learning.
              Under mathematical frameworks, topics such as measure-theoretic
              probability, stochastic calculus, game theory, optimisation and
              formal verification. Neither list is closed.
            </p>
            <p>
              Every output stands on its own. The method is documented, the
              data is traceable, and the result can be checked by anyone who
              reads it. If it cannot survive a room of quants, it does not go
              out under our name.
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
              { k: "Theory & Systems", v: "Two pillars, equal weight. A stochastic calculus proof and a backtesting engine answer to the same bar: assumptions stated, method documented, result reproducible." },
              { k: "Selectivity", v: "Membership is earned. Every member defends their output in front of the group before it ships, then defends it again in public." },
              { k: "Open Research", v: "We publish. Papers, source code, benchmark numbers and the failures. Work nobody can read or run is work nobody can check." },
              { k: "Independence", v: "No house view, no sponsor, no mandate to please. We answer to the work, and we recruit against it, not against social credit." },
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
              One workflow, deliberately narrow. Every paper, proof and system
              we ship has moved through the same four steps. No shortcuts, no
              exceptions, regardless of who is writing it.
            </p>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {[
              { k: "Frame", v: "A precise question and a falsifiable claim, or a system with a target and a latency budget. Vague topics are turned back at the door." },
              { k: "Build", v: "Model or implementation. Assumptions written down, method chosen for reasons rather than familiarity, data provenance and source under version control." },
              { k: "Defend", v: "Internal review with the pillar lead. Sensitivity checks, benchmarks against a baseline, formal verification where the claim allows it, and honest limitations." },
              { k: "Publish", v: "Working paper, source code and benchmark numbers, in public. Failures documented as clearly as results." },
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
                { t: "Q1 2026", h: "Founding", b: "L² Research is formed in the UK around a small group of engineers and mathematicians." },
                { t: "Q2 2026", h: "Two pillars set", b: "Research Engineering · Mathematical Frameworks. Two tracks, one standard." },
                { t: "Q3 2026", h: "First intake", b: "Selection opens. Candidates are judged on what they have built and proved, not on credentials." },
                { t: "Q4 2026", h: "First public output", b: "Initial working papers, benchmarks and source code published under the group's name." },
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
              Each pillar has a lead who owns the standard, runs review and
              holds the pipeline of work published under that heading.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-end lg:px-10 lg:py-20">
          <p className="max-w-xl font-display text-[24px] font-light leading-snug text-foreground lg:text-[30px]">
            Two pillars. One bar.
            <br />
            <span className="text-forest">Read the work, or join us.</span>
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
              Join
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}