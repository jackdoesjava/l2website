import { createFileRoute } from "@tanstack/react-router";
import iconAsset from "@/assets/l2r-icon.png.asset.json";
import { usePillars } from "@/lib/site-content";
import { QuantCanvas } from "@/components/quant-canvas";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "Research Pillars — L² Research" },
      {
        name: "description",
        content:
          "The four areas of active work at L² Research: statistical arbitrage, derivatives and volatility, machine learning in markets, and market microstructure.",
      },
      { property: "og:title", content: "Research Pillars — L² Research" },
      {
        property: "og:description",
        content: "Four areas of active quantitative work.",
      },
    ],
  }),
  component: Pillars,
});

function Pillars() {
  const { data: pillars = [] } = usePillars();
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
              § Research Pillars
            </div>
            <h1 className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-tight text-ice lg:text-[36px]">
              Four areas of active work.
            </h1>
          </div>
          <img src={iconAsset.url} alt="" className="hidden h-14 w-14 opacity-90 md:block" />
        </div>
        <div className="grid grid-cols-1 divide-y divide-white/10 border-b border-white/10 md:grid-cols-2 md:divide-y-0 md:[&>*]:border-b md:[&>*]:border-white/10 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:[&>*]:border-b-0">
          {pillars.map((p) => (
            <div key={p.id} className="px-0 py-10 md:px-8 lg:first:pl-0 lg:last:pr-0">
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