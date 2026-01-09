-- Add specialties column to tipster_profiles table
ALTER TABLE public.tipster_profiles 
ADD COLUMN specialties uuid[];

-- Add constraint to limit maximum 3 specialties
ALTER TABLE public.tipster_profiles 
ADD CONSTRAINT tipster_profiles_specialties_max_3 
CHECK (array_length(specialties, 1) IS NULL OR array_length(specialties, 1) <= 3);

-- Add foreign key constraint for specialties referencing sports
-- Note: We can't add a direct foreign key for array elements, but we can use a trigger for validation

-- Create function to validate specialties reference sports
CREATE OR REPLACE FUNCTION validate_specialties_sports()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.specialties IS NOT NULL THEN
    -- Check if all specialties exist in sports table
    IF EXISTS (
      SELECT 1 
      FROM unnest(NEW.specialties) AS spec_id
      WHERE NOT EXISTS (SELECT 1 FROM sports WHERE id = spec_id)
    ) THEN
      RAISE EXCEPTION 'Invalid specialty: one or more sport IDs do not exist';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate specialties
CREATE TRIGGER validate_specialties_trigger
  BEFORE INSERT OR UPDATE ON public.tipster_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_specialties_sports();

-- Drop the tipster_specialties table as it's no longer needed
DROP TABLE IF EXISTS public.tipster_specialties;