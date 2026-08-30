import { createFileRoute } from "@tanstack/react-router";
import { APPLY_FORM_URL, CONTACT_EMAIL } from "@/lib/site-data";
import { QuantCanvas } from "@/components/quant-canvas";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Join · L² Research" },
      {
        name: "description",
        content:
          "Recruitment at L² Research. Two tracks, three gates, and where to get in touch.",
      },
      { property: "og:title", content: "Join · L² Research" },
      {
        property: "og:description",
        content: "The bar is explicit. Prior finance experience is not required.",
      },
    ],
  }),
  component: Apply,
});

function Apply() {
  return (
    <>
    <section className="relative overflow-hidden border-b border-border bg-ink text-ice">
      <QuantCanvas
        variant="surface"
        className="pointer-events-none absolute inset-0 opacity-95 [mask-image:radial-gradient(ellipse_at_42%_44%,black_44%,transparent_88%)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-ink)_62%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_78%,transparent)_56%,var(--color-ink)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(ellipse_at_24%_40%,color-mix(in_srgb,var(--color-ink)_78%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_50%,transparent)_42%,color-mix(in_srgb,var(--color-ink)_88%,transparent)_100%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="eyebrow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-forest" />
              § Recruitment · 2026
            </div>
            <h1 className="mt-5 font-display text-[36px] font-light leading-[1.05] text-ice lg:text-[56px]">
              The bar is
              <br />
              <span className="font-semibold text-forest">explicit</span>.
            </h1>
            <p className="mt-8 max-w-lg font-sans text-[15px] leading-relaxed text-ice/80">
              Recruitment runs year-round so hiring never stalls the research.
              Exceptional candidates are fast-tracked straight to interview.
            </p>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-ice/10 pt-8">
              {[
                { k: "Rolling", v: "Intake" },
                { k: "3 stages", v: "Evaluation pipeline" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-[20px] font-light text-ice lg:text-[24px]">
                    {s.k}
                  </div>
                  <div className="mt-1 font-sans text-[12px] leading-snug text-ice/60">
                    {s.v}
                  </div>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-6">
            <p className="font-sans text-[16px] leading-relaxed text-ice/85 lg:text-[17px]">
              Theory candidates need probability, statistics and stochastic
              calculus, and the ability to state and defend a proof.
              Engineering candidates need systems fluency in Rust, C++ or
              equivalent, and depth in modern machine learning. Prior finance
              experience is not required.
            </p>

            <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Eligibility</dt>
                <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ice/75">
                  Open to anyone who can do the work. Both tracks hire
                  independently.
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Commitment</dt>
                <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ice/75">
                  Twelve months. Output is the measure, not hours.
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Process</dt>
                <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ice/75">
                  Three gates: application, technical sandbox, interview.
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Enquiries</dt>
                <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ice/75">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-forest">
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-12 flex flex-wrap gap-3">
              <a
                href={APPLY_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="apply-cta"
              >
                Open the form <span aria-hidden>→</span>
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-3 border border-ice/60 px-6 py-4 font-display text-[13px] font-medium uppercase tracking-[0.2em] text-ice transition-colors hover:border-forest hover:text-forest"
              >
                Email us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
        <div className="eyebrow">§ Evaluation pipeline</div>
        <h2 className="mt-5 max-w-2xl font-display text-[28px] font-semibold leading-tight tracking-tight text-foreground lg:text-[34px]">
          Three gates, no theatre.
        </h2>
        <p className="mt-6 max-w-2xl font-sans text-[15px] leading-relaxed text-foreground/75">
          We evaluate execution and rate of learning, not interest. Missing
          knowledge can be taught; talent and work ethic cannot.
        </p>
        <ol className="mt-14 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            {
              n: "01",
              t: "Application & screen",
              d: "A short intake form: CV, links to code, papers or write-ups you own, and two brief written answers on how you work through hard problems.",
            },
            {
              n: "02",
              t: "Technical sandbox",
              d: "A take-home in your track: logic and proof problems for theory, an implementation task in Rust, C++ or machine learning for engineering. Roughly an hour of work, with a few days to return it.",
            },
            {
              n: "03",
              t: "Leadership interview",
              d: "Forty-five minutes: defend your submission, walk through your prior work, then a short live technical. Fluency in your own work is the point.",
            },
          ].map((s) => (
            <li key={s.n} className="px-0 py-10 md:px-8 md:first:pl-0 md:last:pr-0">
              <div className="font-display text-[11px] font-medium tracking-[0.22em] text-forest">
                — {s.n}
              </div>
              <h3 className="mt-5 font-display text-[19px] font-semibold leading-snug text-foreground">
                {s.t}
              </h3>
              <p className="mt-3 font-sans text-[14px] leading-relaxed text-foreground/75">
                {s.d}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="bg-ink text-ice">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="leading-tight">
            <div className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-forest">
              Recruitment · Open
            </div>
            <div className="mt-1.5 font-display text-[20px] font-semibold text-ice lg:text-[24px]">
              Both tracks are hiring.
            </div>
          </div>
          <a href={APPLY_FORM_URL} target="_blank" rel="noreferrer" className="apply-cta">
            Start your application <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
    </>
  );
}