-- Rename kind column to entity_type in user_preferences table
ALTER TABLE user_preferences RENAME COLUMN kind TO entity_type;

-- Update the trigger function to use entity_type instead of kind
CREATE OR REPLACE FUNCTION public.up_pref_assign_position()
RETURNS trigger
LANGUAGE plpgsql
AS $$
declare
  v_entity_type text;
begin
  -- Sécurité : exactement une FK non nulle
  if num_nonnulls(new.sport_id, new.league_id, new.team_id) <> 1 then
    raise exception 'Exactly one of (sport_id, league_id, team_id) must be set';
  end if;

  v_entity_type := case
                     when new.sport_id  is not null then 'sport'
                     when new.league_id is not null then 'league'
                     when new.team_id   is not null then 'team'
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