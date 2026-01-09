-- Mise à jour du trigger pour supporter player_id dans user_preferences
CREATE OR REPLACE FUNCTION public.up_pref_assign_position()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_entity_type entity_type_enum;
begin
  -- Sécurité : exactement une FK non nulle (ajout de player_id)
  if num_nonnulls(new.sport_id, new.league_id, new.team_id, new.player_id) <> 1 then
    raise exception 'Exactly one of (sport_id, league_id, team_id, player_id) must be set';
  end if;

  v_entity_type := case
                     when new.sport_id   is not null then 'sport'::entity_type_enum
                     when new.league_id  is not null then 'league'::entity_type_enum
                     when new.team_id    is not null then 'team'::entity_type_enum
                     when new.player_id  is not null then 'player'::entity_type_enum
                   end;

  if new.position is null or new.position <= 0 then
    select coalesce(max(position) + 1, 1)
      into new.position
    from public.user_preferences
    where user_id = new.user_id
      and entity_type = v_entity_type;
  end if;

  if new.entity_type is null then
    new.entity_type := v_entity_type;
  end if;

  return new;
end;
$function$;