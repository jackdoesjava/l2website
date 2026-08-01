import { createFileRoute } from "@tanstack/react-router";
import { useMembers, type Member } from "@/lib/site-content";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — L² Research" },
      {
        name: "description",
        content:
          "The people behind L² Research — President, Research Leads and Analysts.",
      },
      { property: "og:title", content: "Members — L² Research" },
      {
        property: "og:description",
        content: "A small group, held to one bar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Members,
});

const TIERS = ["Leadership", "Analysts", "Members"] as const;

/** President and pillar leads are all leadership, so they share one row. */
function tierOf(role: string) {
  const r = role.trim().toLowerCase();
  if (
    r.startsWith("president") ||
    r.startsWith("vice") ||
    r.startsWith("founder") ||
    r.includes("lead") ||
    r.includes("head") ||
    r.includes("director")
  )
    return "Leadership";
  if (r.startsWith("analyst") || r.includes("analyst") || r.includes("researcher"))
    return "Analysts";
  return "Members";
}

/** Within leadership, the president always comes first. */
function rankOf(role: string) {
  const r = role.trim().toLowerCase();
  if (r.startsWith("president") || r.startsWith("founder")) return 0;
  if (r.startsWith("vice")) return 1;
  return 2;
}

/** Groups members by tier, ordered by hierarchy then their stored sort order. */
function groupByRole(members: Member[]) {
  const groups = new Map<string, Member[]>();
  for (const m of members) {
    const key = tierOf(m.role);
    const group = groups.get(key);
    if (group) group.push(m);
    else groups.set(key, [m]);
  }
  for (const list of groups.values()) {
    list.sort(
      (a, b) => rankOf(a.role) - rankOf(b.role) || a.sort_order - b.sort_order,
    );
  }
  return [...groups.entries()].sort(
    (a, b) => TIERS.indexOf(a[0] as never) - TIERS.indexOf(b[0] as never),
  );
}

/** Ensures a user-entered profile URL is absolute so the browser doesn't treat it as a relative path. */
function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleaned = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  if (/^(?:www\.)?linkedin\.com\//i.test(cleaned)) return `https://${cleaned}`;
  if (/^in\//i.test(cleaned)) return `https://www.linkedin.com/${cleaned}`;
  return `https://www.linkedin.com/in/${cleaned}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function MemberCard({ m }: { m: Member }) {
  const linkedInUrl = normalizeUrl(m.linkedin_url ?? "");

  return (
    <article className="group relative flex flex-col border border-border bg-card transition-colors hover:border-forest/60">
      <div className="relative aspect-[4/4.6] w-full overflow-hidden bg-secondary">
        {m.photo_signed_url ? (
          <img
            src={m.photo_signed_url}
            alt={`${m.name} — ${m.role}, L² Research`}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-[40px] font-light tracking-[0.08em] text-forest/40">
              {initials(m.name) || "L²"}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-forest/50 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="eyebrow">{m.role}</div>
        <h3 className="mt-1.5 font-display text-[17px] font-medium leading-tight text-foreground">
          {m.name}
        </h3>
        {m.bio && (
          <p className="mt-2 line-clamp-3 font-sans text-[12px] leading-relaxed text-muted-foreground">
            {m.bio}
          </p>
        )}
        {m.linkedin_url && (
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noreferrer noopener external"
            onClick={(event) => {
              event.preventDefault();
              window.open(linkedInUrl, "_blank", "noopener,noreferrer");
            }}
            className="mt-3 inline-flex items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:text-forest"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.06c.53-.95 1.83-1.95 3.77-1.95C20.6 8.75 22 11 22 14.24V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21H9z" />
            </svg>
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}

function Members() {
  const { data: members = [] } = useMembers();
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid items-end gap-8 border-b border-border pb-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="eyebrow">§ The Group</div>
            <h1 className="mt-4 font-display text-[36px] font-light leading-[1.05] tracking-[-0.01em] text-foreground lg:text-[52px]">
              A small group,
              <br />
              <span className="font-semibold text-forest">held to one bar</span>.
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-md font-sans text-[15px] leading-relaxed text-foreground/80">
              Composition is intentionally narrow. Members are selected on
              technical capacity and on the quality of their prior work.
            </p>
            <div className="mt-5 font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {members.length} member{members.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-12">
          {groupByRole(members).map(([role, group]) => (
              <div key={role}>
                <div className="flex items-center gap-4">
                  <div className="eyebrow shrink-0">{role}</div>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {group.map((m) => (
                    <MemberCard key={m.id} m={m} />
                  ))}
                </div>
              </div>
          ))}
          {members.length === 0 && (
            <p className="font-sans text-[14px] text-muted-foreground">
              Members will be listed here shortly.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}