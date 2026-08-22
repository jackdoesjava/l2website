CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "pillars admin write" ON public.pillars;
CREATE POLICY "pillars admin write" ON public.pillars FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "papers admin write" ON public.papers;
CREATE POLICY "papers admin write" ON public.papers FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "members admin write" ON public.members;
CREATE POLICY "members admin write" ON public.members FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "alumni admin write" ON public.alumni;
CREATE POLICY "alumni admin write" ON public.alumni FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "member photos admin insert" ON storage.objects;
CREATE POLICY "member photos admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "member photos admin update" ON storage.objects;
CREATE POLICY "member photos admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'member-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "member photos admin delete" ON storage.objects;
CREATE POLICY "member photos admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-photos' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "paper pdfs admin insert" ON storage.objects;
CREATE POLICY "paper pdfs admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'paper-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "paper pdfs admin update" ON storage.objects;
CREATE POLICY "paper pdfs admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'paper-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));
DROP POLICY IF EXISTS "paper pdfs admin delete" ON storage.objects;
CREATE POLICY "paper pdfs admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'paper-pdfs' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);