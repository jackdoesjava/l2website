import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Pillar = { id: string; tag: string; title: string; body: string; sort_order: number };
export type Paper = {
  id: string; tag: string; date_label: string; title: string;
  authors: string; abstract: string; pdf_url: string | null; sort_order: number;
  featured: boolean;
  pdf_href?: string | null;
};
export type Member = {
  id: string; name: string; role: string; bio: string; sort_order: number;
  photo_url: string | null; linkedin_url: string | null;
  photo_signed_url?: string | null;
};

export const MEMBER_PHOTO_BUCKET = "member-photos";
export const PAPER_PDF_BUCKET = "paper-pdfs";

export async function resolvePaperPdfs(rows: Paper[]): Promise<Paper[]> {
  const paths = Array.from(
    new Set(
      rows
        .map((r) => r.pdf_url)
        .filter((p): p is string => !!p && !/^https?:\/\//i.test(p)),
    ),
  );
  const map = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from(PAPER_PDF_BUCKET)
      .createSignedUrls(paths, 60 * 60);
    (data ?? []).forEach((d) => {
      if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
    });
  }
  return rows.map((r) => ({
    ...r,
    pdf_href: !r.pdf_url
      ? null
      : /^https?:\/\//i.test(r.pdf_url)
        ? r.pdf_url
        : (map.get(r.pdf_url) ?? null),
  }));
}

export async function signMemberPhotos(rows: Member[]): Promise<Member[]> {
  const paths = Array.from(
    new Set(rows.map((r) => r.photo_url).filter((p): p is string => !!p)),
  );
  if (paths.length === 0) return rows;
  const { data } = await supabase.storage
    .from(MEMBER_PHOTO_BUCKET)
    .createSignedUrls(paths, 60 * 60);
  const map = new Map<string, string>();
  (data ?? []).forEach((d) => {
    if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
  });
  return rows.map((r) => ({
    ...r,
    photo_signed_url: r.photo_url ? (map.get(r.photo_url) ?? null) : null,
  }));
}
export type Alumnus = { id: string; name: string; role: string; now_where: string; sort_order: number };

export function usePillars() {
  return useQuery({
    queryKey: ["pillars"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pillars").select("*").order("sort_order");
      if (error) throw error;
      return data as Pillar[];
    },
  });
}

export function usePapers() {
  return useQuery({
    queryKey: ["papers"],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase.from("papers").select("*").order("sort_order");
      if (error) throw error;
      return await resolvePaperPdfs((data ?? []) as Paper[]);
    },
  });
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*").order("sort_order");
      if (error) throw error;
      return await signMemberPhotos((data ?? []) as Member[]);
    },
  });
}

export function useAlumni() {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni").select("*").order("sort_order");
      if (error) throw error;
      return data as Alumnus[];
    },
  });
}