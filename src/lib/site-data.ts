export const PILLARS = [
  {
    tag: "01",
    title: "Statistical Arbitrage",
    body: "Cross-sectional signals, factor decomposition, and empirical tests of mean-reversion across equity universes.",
  },
  {
    tag: "02",
    title: "Derivatives & Volatility",
    body: "Options surfaces, variance structure, and the pricing of risk in listed and OTC markets.",
  },
  {
    tag: "03",
    title: "Machine Learning in Markets",
    body: "Model design under non-stationarity. Where learning helps, where it fails, and how to tell the difference.",
  },
  {
    tag: "04",
    title: "Market Microstructure",
    body: "Order book dynamics, execution cost, and the mechanics that shape observed price behavior.",
  },
] as const;

export const PAPERS = [
  {
    tag: "Working Paper",
    date: "2026",
    title: "Cross-Sectional Momentum in Thinly Traded Equities",
    authors: "L² Research",
    abstract:
      "A revisit of intermediate-horizon momentum on constrained universes, controlling for liquidity and estimation error in the sort.",
  },
  {
    tag: "Note",
    date: "2026",
    title: "The Term Structure of Realized Variance",
    authors: "L² Research",
    abstract:
      "Empirical properties of realized variance across horizons on major index constituents, and their implications for variance swap pricing.",
  },
  {
    tag: "Working Paper",
    date: "2026",
    title: "Regime Detection Without Overfitting",
    authors: "L² Research",
    abstract:
      "A comparison of unsupervised regime classifiers under walk-forward evaluation. Most published gains do not survive.",
  },
] as const;

export const MEMBERS = [
  { name: "TBD", role: "President", bio: "Founding lead. Overall direction and standards." },
  { name: "TBD", role: "Research Lead — Volatility", bio: "Derivatives and variance structure." },
  { name: "TBD", role: "Research Lead — Statistics", bio: "Cross-sectional signals and inference." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
] as const;

export const ALUMNI: { name: string; role: string; now: string }[] = [];

export const APPLY_FORM_URL = "https://forms.office.com/";
export const CONTACT_EMAIL = "info.l2research@gmail.com";