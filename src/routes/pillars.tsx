import { createFileRoute } from "@tanstack/react-router";
import { usePillars } from "@/lib/site-content";
import { QuantCanvas } from "@/components/quant-canvas";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "Pillars · L² Research" },
      {
        name: "description",
        content:
          "Two independent pillars at L² Research. Research Engineering covers topics such as bare-metal systems, low-latency infrastructure, high-performance computing and machine learning. Mathematical Frameworks covers topics such as measure-theoretic probability, stochastic calculus, game theory, optimisation and formal verification. Neither list is closed.",
      },
      { property: "og:title", content: "Pillars · L² Research" },
      {
        property: "og:description",
        content: "Two independent pillars: research engineering and mathematical frameworks.",
      },
    ],
  }),
  component: Pillars,
});

function Pillars() {
  const { data: pillars = [] } = usePillars();
  const count = pillars.length;
  const word =
    ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][count] ??
    String(count);
  const cols =
    count <= 1
      ? "md:grid-cols-1 lg:grid-cols-1 max-w-xl"
      : count === 2
        ? "md:grid-cols-2 lg:grid-cols-2 max-w-4xl"
        : count === 3
          ? "md:grid-cols-3 lg:grid-cols-3 max-w-6xl"
          : "md:grid-cols-2 lg:grid-cols-4 max-w-none";
  return (
    <section className="relative overflow-hidden bg-ink text-ice">
      <QuantCanvas
        variant="surface"
        className="pointer-events-none absolute inset-0 opacity-90 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex items-end justify-between gap-8 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-forest">
              <span className="inline-block h-px w-8 bg-forest" />
              § Pillars
            </div>
            <h1 className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-tight text-ice lg:text-[36px]">
              {word} independent pillar{count === 1 ? "" : "s"}.
            </h1>
          </div>
        </div>
        <div
          className={`mx-auto grid grid-cols-1 divide-y divide-white/10 border-b border-white/10 md:divide-y-0 md:divide-x lg:divide-x ${cols}`}
        >
          {pillars.map((p) => (
            <div key={p.id} className="px-0 py-10 md:px-8">
              <div className="font-display text-[11px] font-medium tracking-[0.22em] text-forest">
                — {p.tag}
              </div>
              <h2 className="mt-6 font-display text-[19px] font-semibold leading-snug text-ice">
                {p.title}
              </h2>
              <p className="mt-4 font-sans text-[14px] leading-relaxed text-[#8A9AAA]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}