
-- Fix error-level security issues: Enable RLS on public tables

-- 1. Enable RLS on collections table
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collections policies: Public read, authenticated users manage their own
CREATE POLICY "Anyone can view collections"
  ON public.collections
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create collections"
  ON public.collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own collections"
  ON public.collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own collections"
  ON public.collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- 2. Enable RLS on fixture_status_ref (reference table)
ALTER TABLE public.fixture_status_ref ENABLE ROW LEVEL SECURITY;

-- Reference table: public read, service role only for writes
CREATE POLICY "Anyone can view fixture statuses"
  ON public.fixture_status_ref
  FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify fixture statuses"
  ON public.fixture_status_ref
  FOR ALL
  TO service_role
  USING (true);

-- 3. Enable RLS on players table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Reference/data table: public read, service role only for writes
CREATE POLICY "Anyone can view players"
  ON public.players
  FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify players"
  ON public.players
  FOR ALL
  TO service_role
  USING (true);
