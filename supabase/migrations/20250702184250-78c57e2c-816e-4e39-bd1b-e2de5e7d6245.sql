-- Create RLS policies for app_social.live_streams table
-- Enable RLS on the table
ALTER TABLE app_social.live_streams ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to create their own live streams
CREATE POLICY "Users can create their own live streams" 
ON app_social.live_streams 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Policy to allow users to view public live streams
CREATE POLICY "Anyone can view public live streams" 
ON app_social.live_streams 
FOR SELECT 
USING (is_public = true);

-- Policy to allow users to view their own live streams (even private ones)
CREATE POLICY "Users can view their own live streams" 
ON app_social.live_streams 
FOR SELECT 
USING (auth.uid() = created_by);

-- Policy to allow users to update their own live streams
CREATE POLICY "Users can update their own live streams" 
ON app_social.live_streams 
FOR UPDATE 
USING (auth.uid() = created_by);