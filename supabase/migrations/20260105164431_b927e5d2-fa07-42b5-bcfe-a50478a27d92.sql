-- 1. Enable RLS on event_tags and tags tables
ALTER TABLE polymarket.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE polymarket.tags ENABLE ROW LEVEL SECURITY;

-- 2. Create public read policies (non-sensitive data)
CREATE POLICY "Anyone can view event_tags" 
  ON polymarket.event_tags
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Anyone can view tags" 
  ON polymarket.tags
  FOR SELECT 
  TO public
  USING (true);

-- 3. Grant SELECT permissions to anon and authenticated roles
GRANT SELECT ON polymarket.event_tags TO anon, authenticated;
GRANT SELECT ON polymarket.tags TO anon, authenticated;