
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- One-shot: first authenticated caller becomes admin
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id <> uid) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Content tables
CREATE TABLE public.pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pillars TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pillars TO authenticated;
GRANT ALL ON public.pillars TO service_role;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pillars public read" ON public.pillars FOR SELECT USING (true);
CREATE POLICY "pillars admin write" ON public.pillars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pillars_updated BEFORE UPDATE ON public.pillars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text NOT NULL,
  date_label text NOT NULL,
  title text NOT NULL,
  authors text NOT NULL,
  abstract text NOT NULL,
  pdf_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.papers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.papers TO authenticated;
GRANT ALL ON public.papers TO service_role;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "papers public read" ON public.papers FOR SELECT USING (true);
CREATE POLICY "papers admin write" ON public.papers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER papers_updated BEFORE UPDATE ON public.papers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members public read" ON public.members FOR SELECT USING (true);
CREATE POLICY "members admin write" ON public.members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER members_updated BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  now_where text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alumni TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.alumni TO authenticated;
GRANT ALL ON public.alumni TO service_role;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni public read" ON public.alumni FOR SELECT USING (true);
CREATE POLICY "alumni admin write" ON public.alumni FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER alumni_updated BEFORE UPDATE ON public.alumni FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed pillars
INSERT INTO public.pillars (tag, title, body, sort_order) VALUES
('01','Statistical Arbitrage','Cross-sectional signals, factor decomposition, and empirical tests of mean-reversion across equity universes.',1),
('02','Derivatives & Volatility','Options surfaces, variance structure, and the pricing of risk in listed and OTC markets.',2),
('03','Machine Learning in Markets','Model design under non-stationarity. Where learning helps, where it fails, and how to tell the difference.',3),
('04','Market Microstructure','Order book dynamics, execution cost, and the mechanics that shape observed price behavior.',4);

-- Seed papers
INSERT INTO public.papers (tag, date_label, title, authors, abstract, sort_order) VALUES
('Working Paper','2026','Cross-Sectional Momentum in Thinly Traded Equities','L² Research','A revisit of intermediate-horizon momentum on constrained universes, controlling for liquidity and estimation error in the sort.',1),
('Note','2026','The Term Structure of Realized Variance','L² Research','Empirical properties of realized variance across horizons on major index constituents, and their implications for variance swap pricing.',2),
('Working Paper','2026','Regime Detection Without Overfitting','L² Research','A comparison of unsupervised regime classifiers under walk-forward evaluation. Most published gains do not survive.',3);

-- Seed members
INSERT INTO public.members (name, role, bio, sort_order) VALUES
('TBD','President','Founding lead. Overall direction and standards.',1),
('TBD','Research Lead — Volatility','Derivatives and variance structure.',2),
('TBD','Research Lead — Statistics','Cross-sectional signals and inference.',3),
('TBD','Analyst','Contributing to active working papers.',4),
('TBD','Analyst','Contributing to active working papers.',5),
('TBD','Analyst','Contributing to active working papers.',6);
