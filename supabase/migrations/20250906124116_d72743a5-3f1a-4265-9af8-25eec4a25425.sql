-- Create entity_type enum
CREATE TYPE entity_type_enum AS ENUM ('sport', 'league', 'team');

-- Update user_preferences table to use the enum
ALTER TABLE user_preferences 
ALTER COLUMN entity_type TYPE entity_type_enum 
USING entity_type::entity_type_enum;

-- Make entity_type NOT NULL since it's required
ALTER TABLE user_preferences 
ALTER COLUMN entity_type SET NOT NULL;

-- Update the trigger function to use the enum type
CREATE OR REPLACE FUNCTION public.up_pref_assign_position()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  v_entity_type entity_type_enum;
begin
  -- Sécurité : exactement une FK non nulle
  if num_nonnulls(new.sport_id, new.league_id, new.team_id) <> 1 then
    raise exception 'Exactly one of (sport_id, league_id, team_id) must be set';
  end if;

  v_entity_type := case
                     when new.sport_id  is not null then 'sport'::entity_type_enum
                     when new.league_id is not null then 'league'::entity_type_enum
                     when new.team_id   is not null then 'team'::entity_type_enum
                   end;

  if new.position is null or new.position <= 0 then
    select coalesce(max(position) + 1, 1)
      into new.position
    from public.user_preferences
    where user_id = new.user_id
      and entity_type = v_entity_type;
  end if;

  -- Assigner automatiquement entity_type si pas défini
  if new.entity_type is null then
    new.entity_type := v_entity_type;
  end if;

  return new;
end;
$$;