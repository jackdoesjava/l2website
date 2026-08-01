import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  usePillars,
  usePapers,
  useMembers,
  MEMBER_PHOTO_BUCKET,
  PAPER_PDF_BUCKET,
  type Pillar,
  type Paper,
  type Member,
} from "@/lib/site-content";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — L² Research" },
      { name: "description", content: "Administrative editor for L² Research site content." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "pillars" | "papers" | "members";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("pillars");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data);
    })();
    return () => { cancelled = true; };
  }, [session]);

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!session) return <AuthCard />;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="eyebrow">§ Admin</div>
          <h1 className="mt-3 font-display text-[28px] font-semibold tracking-tight">
            Content editor
          </h1>
          <p className="mt-2 font-sans text-[13px] text-muted-foreground">
            Signed in as {session.user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => supabase.auth.signOut()}
            className="border border-border px-3 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-forest"
          >
            Sign out
          </button>
        </div>
      </div>

      {!isAdmin ? (
        <div className="mt-10 rounded border border-border bg-secondary p-6 font-sans text-[14px] text-foreground/80">
          This account is signed in but has no admin role. Ask an existing
          admin to grant you access.
        </div>
      ) : (
        <>
          <nav className="mt-8 flex flex-wrap gap-1 border-b border-border">
            {(["pillars", "papers", "members"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "px-4 py-2 font-display text-[12px] font-medium uppercase tracking-[0.18em] transition-colors " +
                  (tab === t
                    ? "border-b-2 border-forest text-forest"
                    : "text-foreground/60 hover:text-forest")
                }
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="mt-8">
            {tab === "pillars" && <PillarsEditor />}
            {tab === "papers" && <PapersEditor />}
            {tab === "members" && <MembersEditor />}
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------ Auth ------------------------ */

function AuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      if (error) setMsg(error.message);
      else setMsg("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-md px-6 py-24">
      <div className="eyebrow">§ Admin</div>
      <h1 className="mt-3 font-display text-[28px] font-semibold tracking-tight">
        {mode === "signin" ? "Sign in" : "Create admin account"}
      </h1>
      <p className="mt-2 font-sans text-[13px] text-muted-foreground">
        Restricted area for L² Research administrators.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Email">
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-input bg-background px-3 py-2 font-sans text-[14px] outline-none focus:border-forest"
          />
        </Field>
        <Field label="Password">
          <input
            type="password" required minLength={8} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-input bg-background px-3 py-2 font-sans text-[14px] outline-none focus:border-forest"
          />
        </Field>
        {msg && <div className="text-[13px] text-foreground/80">{msg}</div>}
        <button disabled={busy} className="apply-cta w-full justify-center disabled:opacity-50">
          {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 font-sans text-[13px] text-muted-foreground hover:text-forest"
      >
        {mode === "signin" ? "Need to create the first admin account? Sign up →" : "Have an account? Sign in →"}
      </button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/70">
        {label}
      </div>
      {children}
    </label>
  );
}

/* ------------------------ Editors ------------------------ */

function useInvalidate(key: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [key] });
}

/** Runs a Supabase call and surfaces a success / error toast. */
async function run(
  label: string,
  fn: () => PromiseLike<{ error: { message: string } | null }>,
): Promise<boolean> {
  try {
    const { error } = await fn();
    if (error) {
      toast.error(`${label} failed`, { description: error.message });
      return false;
    }
    toast.success(label);
    return true;
  } catch (e) {
    toast.error(`${label} failed`, {
      description: e instanceof Error ? e.message : "Unexpected error",
    });
    return false;
  }
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-input bg-background px-2.5 py-1.5 font-sans text-[13px] outline-none focus:border-forest"
    />
  );
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full border border-input bg-background px-2.5 py-1.5 font-sans text-[13px] outline-none focus:border-forest"
    />
  );
}

function RowActions({ onSave, onDelete, saving }: { onSave: () => void; onDelete: () => void; saving?: boolean }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onSave} disabled={saving} className="apply-cta-sm disabled:opacity-50">Save</button>
      <button
        onClick={onDelete}
        className="border border-border px-3 py-1.5 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

function PillarsEditor() {
  const { data = [] } = usePillars();
  const invalidate = useInvalidate("pillars");

  async function add() {
    const nextOrder = (data.at(-1)?.sort_order ?? 0) + 1;
    await run("Pillar added", () =>
      supabase.from("pillars").insert({
        tag: String(nextOrder).padStart(2, "0"),
        title: "New Pillar",
        body: "",
        sort_order: nextOrder,
      }),
    );
    invalidate();
  }

  return (
    <div className="space-y-6">
      <button onClick={add} className="apply-cta-sm">+ Add pillar</button>
      <div className="space-y-4">
        {data.map((p) => (
          <PillarRow key={p.id} pillar={p} onChanged={invalidate} />
        ))}
      </div>
    </div>
  );
}

function PillarRow({ pillar, onChanged }: { pillar: Pillar; onChanged: () => void }) {
  const [row, setRow] = useState(pillar);
  const [busy, setBusy] = useState(false);
  useEffect(() => setRow(pillar), [pillar]);

  return (
    <div className="border border-border p-4">
      <div className="grid gap-3 md:grid-cols-[80px_1fr_120px]">
        <TextInput value={row.tag} onChange={(e) => setRow({ ...row, tag: e.target.value })} placeholder="Tag" />
        <TextInput value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} placeholder="Title" />
        <TextInput type="number" value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })} />
      </div>
      <div className="mt-3">
        <TextArea value={row.body} onChange={(e) => setRow({ ...row, body: e.target.value })} placeholder="Body" />
      </div>
      <div className="mt-3">
        <RowActions
          saving={busy}
          onSave={async () => {
            setBusy(true);
            await run("Pillar saved", () =>
              supabase.from("pillars").update({
                tag: row.tag, title: row.title, body: row.body, sort_order: row.sort_order,
              }).eq("id", row.id),
            );
            setBusy(false); onChanged();
          }}
          onDelete={async () => {
            if (!confirm("Delete this pillar?")) return;
            await run("Pillar deleted", () =>
              supabase.from("pillars").delete().eq("id", row.id),
            );
            onChanged();
          }}
        />
      </div>
    </div>
  );
}

function PapersEditor() {
  const { data = [] } = usePapers();
  const invalidate = useInvalidate("papers");

  async function add() {
    const nextOrder = (data.at(-1)?.sort_order ?? 0) + 1;
    await run("Paper added", () =>
      supabase.from("papers").insert({
        tag: "Working Paper", date_label: String(new Date().getFullYear()),
        title: "Untitled", authors: "L² Research", abstract: "", sort_order: nextOrder,
      }),
    );
    invalidate();
  }

  return (
    <div className="space-y-6">
      <button onClick={add} className="apply-cta-sm">+ Add paper</button>
      <div className="space-y-4">
        {data.map((p) => <PaperRow key={p.id} paper={p} onChanged={invalidate} />)}
      </div>
    </div>
  );
}

function PaperRow({ paper, onChanged }: { paper: Paper; onChanged: () => void }) {
  const [row, setRow] = useState(paper);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => setRow(paper), [paper]);

  async function uploadPdf(file: File) {
    setUploading(true);
    const path = `${row.id}/${Date.now()}.pdf`;
    const { error } = await supabase.storage
      .from(PAPER_PDF_BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (error) {
      toast.error("PDF upload failed", { description: error.message });
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase
      .from("papers").update({ pdf_url: path }).eq("id", row.id);
    if (dbErr) toast.error("PDF save failed", { description: dbErr.message });
    else toast.success("PDF uploaded");
    setUploading(false);
    onChanged();
  }

  async function removePdf() {
    const stored = row.pdf_url;
    if (stored && !/^https?:\/\//i.test(stored)) {
      await supabase.storage.from(PAPER_PDF_BUCKET).remove([stored]);
    }
    await run("PDF removed", () =>
      supabase.from("papers").update({ pdf_url: null }).eq("id", row.id),
    );
    onChanged();
  }

  return (
    <div className="border border-border p-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput value={row.date_label} onChange={(e) => setRow({ ...row, date_label: e.target.value })} placeholder="Date label" />
        <TextInput type="number" value={row.sort_order}
          onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })} />
      </div>
      <TextInput value={row.title} onChange={(e) => setRow({ ...row, title: e.target.value })} placeholder="Title" />
      <TextInput value={row.authors} onChange={(e) => setRow({ ...row, authors: e.target.value })} placeholder="Authors" />
      <TextArea value={row.abstract} onChange={(e) => setRow({ ...row, abstract: e.target.value })} placeholder="Abstract" />
      <TextInput value={row.pdf_url ?? ""} onChange={(e) => setRow({ ...row, pdf_url: e.target.value || null })}
        placeholder="PDF URL or uploaded file path (optional)" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer border border-border px-3 py-2 font-sans text-[12px] text-foreground transition-colors hover:border-forest">
          {uploading ? "Uploading…" : row.pdf_url ? "Replace PDF" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadPdf(f);
              e.target.value = "";
            }}
          />
        </label>
        {row.pdf_url && (
          <button
            type="button"
            onClick={removePdf}
            className="font-sans text-[12px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Remove PDF
          </button>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 font-sans text-[12px] text-foreground">
        <input
          type="checkbox"
          checked={row.featured}
          onChange={(e) => setRow({ ...row, featured: e.target.checked })}
          className="h-4 w-4 accent-forest"
        />
          Feature this paper at the top of the Research page
      </label>
      <RowActions
        saving={busy}
        onSave={async () => {
          setBusy(true);
          await run("Paper saved", async () => {
            if (row.featured) {
              const res = await supabase
                .from("papers").update({ featured: false }).neq("id", row.id);
              if (res.error) return res;
            }
            return await supabase.from("papers").update({
              date_label: row.date_label, title: row.title,
              authors: row.authors, abstract: row.abstract, pdf_url: row.pdf_url,
              sort_order: row.sort_order, featured: row.featured,
            }).eq("id", row.id);
          });
          setBusy(false); onChanged();
        }}
        onDelete={async () => {
          if (!confirm("Delete this paper?")) return;
          await run("Paper deleted", () =>
            supabase.from("papers").delete().eq("id", row.id),
          );
          onChanged();
        }}
      />
    </div>
  );
}

function MembersEditor() {
  const { data = [] } = useMembers();
  const invalidate = useInvalidate("members");

  async function add() {
    const nextOrder = (data.at(-1)?.sort_order ?? 0) + 1;
    await run("Member added", () =>
      supabase.from("members").insert({
        name: "New member", role: "Analyst", bio: "", sort_order: nextOrder,
      }),
    );
    invalidate();
  }

  return (
    <div className="space-y-6">
      <button onClick={add} className="apply-cta-sm">+ Add member</button>
      <p className="font-sans text-[12px] text-muted-foreground">
        Members page groups by role text — "President" and any "… Lead" role show under
        Leadership (president first), roles containing "Analyst" show under Analysts,
        anything else under Members. Use sort order to arrange within a group.
      </p>
      <div className="space-y-4">
        {data.map((m) => <MemberRow key={m.id} member={m} onChanged={invalidate} />)}
      </div>
    </div>
  );
}

function MemberRow({ member, onChanged }: { member: Member; onChanged: () => void }) {
  const [row, setRow] = useState(member);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => setRow(member), [member]);

  async function uploadPhoto(file: File) {
    setUploading(true); setErr(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${row.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(MEMBER_PHOTO_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setErr(error.message);
      toast.error("Photo upload failed", { description: error.message });
      setUploading(false);
      return;
    }
    const { error: dbErr } = await supabase
      .from("members").update({ photo_url: path }).eq("id", row.id);
    if (dbErr) {
      setErr(dbErr.message);
      toast.error("Photo save failed", { description: dbErr.message });
    } else {
      toast.success("Photo uploaded");
    }
    setUploading(false);
    onChanged();
  }

  return (
    <div className="border border-border p-4 space-y-3">
      <div className="flex gap-4">
        <div className="w-24 shrink-0">
          <div className="aspect-[4/5] w-full overflow-hidden border border-border bg-secondary">
            {member.photo_signed_url ? (
              <img src={member.photo_signed_url} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-sans text-[11px] text-muted-foreground">
                No photo
              </div>
            )}
          </div>
          <label className="mt-2 block cursor-pointer border border-border px-2 py-1 text-center font-display text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/80 hover:text-forest">
            {uploading ? "…" : "Upload"}
            <input
              type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }}
            />
          </label>
          {row.photo_url && (
            <button
              onClick={async () => {
                await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([row.photo_url!]);
                await run("Photo removed", () =>
                  supabase.from("members").update({ photo_url: null }).eq("id", row.id),
                );
                onChanged();
              }}
              className="mt-1 w-full font-sans text-[11px] text-destructive hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_100px]">
            <TextInput value={row.name} onChange={(e) => setRow({ ...row, name: e.target.value })} placeholder="Name" />
            <TextInput value={row.role} onChange={(e) => setRow({ ...row, role: e.target.value })} placeholder="Role" />
            <TextInput type="number" value={row.sort_order}
              onChange={(e) => setRow({ ...row, sort_order: Number(e.target.value) })} />
          </div>
          <TextInput
            value={row.linkedin_url ?? ""}
            onChange={(e) => setRow({ ...row, linkedin_url: e.target.value || null })}
            placeholder="LinkedIn URL (https://www.linkedin.com/in/…)"
          />
          <TextArea value={row.bio} onChange={(e) => setRow({ ...row, bio: e.target.value })} placeholder="Bio" />
        </div>
      </div>
      {err && <div className="font-sans text-[12px] text-destructive">{err}</div>}
      <RowActions
        saving={busy}
        onSave={async () => {
          setBusy(true);
          await run("Member saved", () =>
            supabase.from("members").update({
              name: row.name, role: row.role, bio: row.bio, sort_order: row.sort_order,
              linkedin_url: row.linkedin_url,
            }).eq("id", row.id),
          );
          setBusy(false); onChanged();
        }}
        onDelete={async () => {
          if (!confirm("Delete this member?")) return;
          if (row.photo_url) await supabase.storage.from(MEMBER_PHOTO_BUCKET).remove([row.photo_url]);
          await run("Member deleted", () =>
            supabase.from("members").delete().eq("id", row.id),
          );
          onChanged();
        }}
      />
    </div>
  );
}
