export const PILLARS = [
  {
    tag: "01",
    title: "Mathematical Frameworks",
    body: "Topics such as measure-theoretic probability, stochastic calculus, game theory, optimisation and formal verification. The list is not closed. Results are stated precisely and verified formally.",
  },
  {
    tag: "02",
    title: "Research Engineering",
    body: "Topics such as bare-metal systems, low-latency infrastructure, high-performance computing and machine learning. The list is not closed. Written close to the metal, in Rust and C++.",
  },
] as const;

export const PAPERS = [
  {
    tag: "Working Paper",
    date: "2026",
    title: "Selective State Space Models on Tick-Level Sequences",
    authors: "L² Research",
    abstract:
      "Mamba benchmarked against transformer baselines on raw order flow. Linear-time inference holds at sequence length. The accuracy gap does not.",
  },
  {
    tag: "Note",
    date: "2026",
    title: "Equilibrium Under Latency Asymmetry",
    authors: "L² Research",
    abstract:
      "A game-theoretic model of quoting when participants observe the book at different delays. Existence and uniqueness of the equilibrium, with a closed form in the two-player case.",
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
  { name: "TBD", role: "Engineering Lead", bio: "Systems architecture and low-latency infrastructure." },
  { name: "TBD", role: "Mathematics Lead", bio: "Stochastic calculus and formal verification." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
  { name: "TBD", role: "Analyst", bio: "Contributing to active working papers." },
] as const;

export const ALUMNI: { name: string; role: string; now: string }[] = [];

export const APPLY_FORM_URL = "https://forms.office.com/";
export const CONTACT_EMAIL = "info.l2research@gmail.com";