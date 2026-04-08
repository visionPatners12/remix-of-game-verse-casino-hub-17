# Analyse du Flow Ludo - Rapport d'Erreurs

## Architecture Actuelle

### Edge Functions (4 fonctions actives)
| Fonction | JWT | Rôle | Status |
|----------|-----|------|--------|
| `ludo-game` | ✅ | Principale (create/join/start/roll/move/skip/exit/claimPrize) | **ACTIVE - Utilisée par le frontend** |
| `ludo` | ✅ | Ancienne version (create/join/roll/move) | **ACTIVE - OBSOLÈTE** |
| `roll-dice` | ✅ | Ancien roll séparé | **ACTIVE - OBSOLÈTE** |
| `check-ludo-deposits` | ❌ | Vérification des dépôts on-chain | **ACTIVE** |

### Tables Supabase
- `ludo_games` - État du jeu (positions, turn, dice, status, pot)
- `ludo_game_players` - Joueurs par partie (color, deposit_status, is_ready)
- `ludo_commissions` - Commissions MLM
- `ludo_refund_queue` - File de remboursement

---

## ERREURS CRITIQUES (Game Breaking)

### 1. ❌ ENTRY_INDEX.Y = START_INDEX.Y = 28 → Yellow entre en zone safe immédiatement

**Fichiers affectés :**
- `ludo-game/ludoLogic.ts` ligne: `ENTRY_INDEX = { R: 54, G: 12, Y: 28, B: 40 }`
- `ludo/ludoModel.ts` ligne: `ENTRY_INDEX = { R:54, G:12, Y:28, B:40 }`
- Frontend `src/features/ludo/model/ludoModel.ts` ligne: `ENTRY_INDEX = { R:54, G:12, Y:28, B:40 }`

**Problème :**
```
START_INDEX = { R:0, G:14, Y:28, B:42 }
ENTRY_INDEX = { R:54, G:12, Y:28, B:40 }
```

Pour calculer la distance à parcourir avant d'entrer dans le couloir sécurisé :
```
dist = (ENTRY_INDEX[color] - currentPosition + 56) % 56
```

| Couleur | Départ | Entrée | Distance à parcourir |
|---------|--------|--------|---------------------|
| R | 0 | 54 | **54 cases** ✅ |
| G | 14 | 12 | **54 cases** ✅ |
| **Y** | **28** | **28** | **0 cases** ❌❌❌ |
| B | 42 | 40 | **54 cases** ✅ |

**Impact :** Yellow entre dans le couloir sécurisé **dès son premier mouvement** après avoir spawn ! Avec un dé de 1, Yellow va directement en position safe 300. Avec un dé de 6, il avance jusqu'à 305. Les autres couleurs doivent parcourir 54 cases.

**Fix :** `ENTRY_INDEX.Y` devrait être `26` (pas `28`), pour que Yellow parcoure aussi 54 cases comme les autres.

---

### 2. ❌ SAFE_LEN incohérent entre les edge functions

| Source | SAFE_LEN | Couloir safe | GOAL à |
|--------|----------|-------------|--------|
| `ludo` (old) | **5** | 0..4 | index 5 |
| `ludo-game` (new) | **6** | 0..5 | index 6 |
| Frontend | **6** | 0..5 | index 6 |

**Problème :** L'ancienne edge function `ludo` utilise `SAFE_LEN = 5`, ce qui signifie que le couloir safe a 5 cases (indices 0 à 4). La nouvelle edge function et le frontend utilisent `SAFE_LEN = 6` (indices 0 à 5).

**Impact :** Si l'ancienne fonction est appelée (elle est encore ACTIVE), elle peut créer des positions invalides. Un pion en position `safe_base + 5` (ex: 105 pour Red) est valide dans le nouveau système mais serait au GOAL dans l'ancien.

---

### 3. ❌ Fonctions edge dupliquées avec logiques incompatibles

**3 edge functions actives pour le même jeu avec des logiques DIFFÉRENTES :**

| Feature | `ludo` (old) | `ludo-game` (new) | `roll-dice` |
|---------|-------------|-------------------|-------------|
| HOME | `-2` (unique) | `-10,-11,...` (per-color per-pawn) | N/A |
| Capture → | `HOME (-2)` | `PRISON (-100,-101,...)` | N/A |
| SAFE_LEN | 5 | 6 | N/A |
| Blockades | ❌ Non | ✅ Oui | N/A |
| Optimistic Lock | Partiel | Complet | ❌ Non |
| Sécurité dé | `Math.random()` | `crypto.getRandomValues()` | `Math.random()` |

**Impact :** Si un joueur appelle `ludo` au lieu de `ludo-game`, l'état du jeu sera corrompu :
- Les captures envoient au `-2` au lieu de la prison
- Le HOME_BASE ne correspond pas aux positions initiales en DB
- Le pion capturé ne pourra jamais sortir car le nouveau code ne reconnaît pas `-2`

---

### 4. ❌ `roll-dice` change le tour AVANT le mouvement

```typescript
// roll-dice/index.ts - BUG CRITIQUE
// Le tour est changé IMMÉDIATEMENT après le roll
let nextTurn = gameData.turn;
if (diceValue !== 6 || !gameData.extra_turn_on_six) {
  // Move to next player BEFORE the move is made!
  nextTurn = players[nextIndex].color;
}

await supabase.from('ludo_games').update({
  dice: diceValue,
  turn: nextTurn, // ❌ Tour changé avant le mouvement!
});
```

**Flow correct :** Roll → Move → Turn Change
**Flow `roll-dice` :** Roll + Turn Change → Move impossible (car ce n'est plus son tour)

---

## ERREURS HAUTES (Functional Issues)

### 5. ❌ `ludo_increment_pot` RPC n'existe PAS

L'edge function `check-ludo-deposits` appelle :
```typescript
await supabase.rpc("ludo_increment_pot", {
  p_game_id: gameId,
  p_amount: addToPot,
});
```

**Mais cette fonction RPC n'existe pas dans la base de données !**

Fonctions RPC existantes :
- `calculate_ludo_commissions` ✅
- `get_ludo_referral_stats` ✅
- `validate_ludo_positions` ✅
- `ludo_increment_pot` ❌ **MANQUANTE**

**Impact :** Pour les jeux avec mise (bet_amount > 0), quand un dépôt est confirmé on-chain, le pot ne sera JAMAIS incrémenté. Le pot restera à 0 même avec des dépôts confirmés.

---

### 6. ❌ `current_players` jamais incrémenté correctement

Le champ `current_players` dans `ludo_games` a une valeur par défaut de `0`.

- `handleCreate` : Ne met pas à jour `current_players` après l'insertion du créateur
- `handleJoin` : Ne met pas à jour `current_players` après le join

Les données réelles confirment : `current_players` est tantôt 0, tantôt 1, tantôt 2 - sans cohérence avec le nombre réel de joueurs.

**Impact :** Le frontend ou d'autres logiques qui se basent sur `current_players` pour déterminer si la partie est pleine auront un comportement incorrect.

---

### 7. ❌ Partie avec bet_amount en "pending" éternellement bloquée

Jeu `56664f15` en base :
```json
{
  "status": "created",
  "bet_amount": "1",
  "pot": "0",
  "player": {
    "deposit_status": "pending",
    "tx_hash": null,  // ❌ Pas de hash de transaction!
    "is_ready": false
  }
}
```

**Problème :** Le joueur a un `deposit_status = "pending"` mais `tx_hash = null`. Le cron `check-ludo-deposits` filtre avec `.neq("tx_hash", null)`, donc ce joueur ne sera JAMAIS vérifié. Il est bloqué pour toujours en "pending".

**Impact :** Les jeux payants où le joueur n'a pas soumis de tx_hash restent bloqués indéfiniment. Pas de mécanisme de timeout ou de nettoyage.

---

### 8. ❌ Partie gagnée sans avoir atteint GOAL

Jeu `4f313d83` :
```json
{
  "winner": "R",
  "status": "finished",
  "positions": {
    "R": [100, 101, 102, 103],  // Tous en safe corridor, PAS au GOAL (999)!
    "B": [-40, -41, -42, -43]   // Tous à home
  }
}
```

Red est déclaré gagnant avec tous ses pions dans le couloir safe (100-103), pas au GOAL (999). Cela vient de `finalizeGameIfNeeded` qui déclare un gagnant quand il ne reste qu'un seul joueur actif (l'autre a quitté), même si aucun pion n'est arrivé.

**Impact :** Logiquement correct (dernier joueur gagne) mais les positions finales sont trompeuses. Le `position` (ranking) n'est pas toujours assigné correctement.

---

## ERREURS MOYENNES (Logic Issues)

### 9. ⚠️ Protection START_INDEX absente dans l'ancienne fonction

`ludo-game` (new) protège les cases de départ :
```typescript
// Protection START_INDEX (pas de capture sur la case de départ de l'adversaire)
if (newPosition === START_INDEX[candidate.color]) capturedPawn = undefined;
```

`ludo` (old) ne fait AUCUNE vérification de protection des cases de départ.

---

### 10. ⚠️ Frontend `ludoApi.ts` - le endpoint `action` vs `endpoint`

Le frontend envoie `action` dans le body :
```typescript
supabase.functions.invoke('ludo-game', {
  body: { action: 'roll', gameId }
});
```

Mais `ludo-game/index.ts` accepte les deux :
```typescript
const ep = body?.endpoint ?? body?.action;
```

Cependant, si le frontend envoyait `endpoint` au lieu de `action`, ou inversement, le routage échouerait silencieusement.

---

### 11. ⚠️ `canEnterSafe` frontend vs backend - comportement identique mais `SAFE_LEN` différent

Le frontend utilise `SAFE_LEN = 6` dans `canEnterSafe` :
```typescript
if (rem > SAFE_LEN) return { invalid:true };     // > 6
if (rem === SAFE_LEN) return { enter:true, goal:true }; // === 6
return { enter:true, safeTo: SAFE_BASE[color] + rem };  // 0..5
```

Mais le vieux backend `ludo/ludoModel.ts` utilise `SAFE_LEN = 5`. Si le frontend calcule qu'un mouvement est possible (basé sur SAFE_LEN=6) mais que l'ancien backend rejette (basé sur SAFE_LEN=5), le joueur voit un mouvement possible mais ne peut pas le jouer.

---

### 12. ⚠️ `exit` handler - pas d'update de `current_players`

Quand un joueur quitte (exit), `current_players` n'est pas décrémenté.

---

### 13. ⚠️ Pas de validation `max_players` lors du `join`

Le handler `join` dans `ludo-game` vérifie :
```typescript
const current = players?.length ?? 0;
const max = game.max_players ?? 4;
if (current >= max) throw new LudoHandledError("BAD_STATE", "Game is full");
```

Mais comme `current_players` n'est pas maintenu, cette vérification se fait par un SELECT count, ce qui est correct mais rajoute une requête.

---

## Données incohérentes trouvées en base

| Game ID | Status | Anomalie |
|---------|--------|----------|
| `a9b4b8a2` | finished | Winner=R mais TOUS les pions de R sont à home (-10,-11,-12,-13). Victoire par abandon. |
| `56664f15` | created | deposit_status=pending, tx_hash=null. Bloqué éternellement. |
| `4f313d83` | finished | Winner=R mais pions à [100,101,102,103] pas au GOAL(999). |

---

---

# PARTIE 2 : SYSTÈME DE JEU, EXPÉRIENCE UTILISATEUR & CONNEXION EN TEMPS RÉEL

---

## ERREURS CRITIQUES - CONNEXION EN TEMPS RÉEL

### 14. ❌ Timer expire simultanément sur TOUS les clients → multiple autoPlay

**Fichier :** `TurnTimer.tsx` + `LudoKonva.tsx` (handleTimeExpired)

**Problème :** Le `TurnTimer` tourne sur CHAQUE client connecté. Quand le timer atteint 0, CHAQUE client appelle `handleTimeExpired()` → `autoPlay`. Avec 4 joueurs, 4 requêtes `autoPlay` arrivent en parallèle au backend.

```
Joueur 1 → autoPlay ← succès (gagne le lock optimiste)
Joueur 2 → autoPlay ← RETRY (rev a changé)
Joueur 3 → autoPlay ← RETRY
Joueur 4 → autoPlay ← RETRY
```

**Impact :** 
- 3 requêtes inutiles sur 4 (75% de charge gaspillée)
- Race condition potentielle si le retry aboutit entre-temps
- Confusion côté UX : le joueur dont le timer expire voit un toast alors que ce n'était pas sa faute

**Fix recommandé :** Seul le joueur dont c'est le tour devrait appeler `autoPlay`. Ou mieux : un cron/scheduler côté backend qui vérifie les timeouts.

---

### 15. ❌ `beforeunload` est async mais le navigateur n'attend pas

**Fichier :** `useRealtimeGame.ts` (lignes 223-239)

```typescript
// ❌ Le navigateur peut fermer AVANT que ces await se terminent
const handleBeforeUnload = async () => {
  const { data: player } = await supabase.from(...).select(...);
  if (player) {
    await supabase.from(...).update({ is_connected: false });
  }
};
```

**Impact :** Le joueur reste `is_connected: true` en base même après avoir fermé l'onglet. Les autres joueurs voient ce joueur comme "en ligne" alors qu'il est parti.

**Fix recommandé :** Utiliser `navigator.sendBeacon()` ou Supabase Presence channel au lieu de l'approche heartbeat.

---

### 16. ⚠️ Pas de retry automatique sur CHANNEL_ERROR / TIMED_OUT

**Fichier :** `useRealtimeGame.ts` (lignes 103-111, 151-159)

```typescript
.subscribe((status, err) => {
  if (status === 'CHANNEL_ERROR') {
    logger.error('❌ Game channel error:', err);
    // ❌ Aucun retry ! Le joueur perd la connexion temps réel silencieusement
  } else if (status === 'TIMED_OUT') {
    logger.warn('⏱️ Game channel timed out, will retry...');
    // ❌ Le commentaire dit "will retry" mais aucun code de retry !
  }
});
```

**Impact :** Si le WebSocket tombe, le joueur ne reçoit plus les mises à jour en temps réel (mouvements des adversaires, changements de tour, dés). Le jeu semble "gelé" sans aucune notification à l'utilisateur.

---

### 17. ⚠️ Heartbeat toutes les 30s est trop lent pour un jeu temps réel

**Fichier :** `useRealtimeGame.ts` (ligne 219)

```typescript
const interval = setInterval(updateHeartbeat, 30000); // 30 secondes !
```

Le timer de tour est de 30s. Le heartbeat est aussi de 30s. Un joueur peut être déconnecté pendant presque tout un tour sans que les autres le sachent.

**Fix recommandé :** Réduire à 10s ou utiliser Supabase Presence qui gère la connectivité nativement.

---

## ERREURS SYSTÈME DE JEU

### 18. ❌ `isAtHome` frontend accepte des positions invalides

**Fichier :** `LudoKonva.tsx` (lignes 363-367)

```typescript
const isAtHome = (position: number, color: Color): boolean => {
  const base = HOME_BASE[color]; // {R:-10, G:-20, Y:-30, B:-40}
  return (position >= base && position <= base + 3) 
      || (position <= base && position >= base - 3);
};
```

Pour Red (base = -10) :
- Première condition : `-10 ≤ position ≤ -7` → accepte **-9, -8, -7** ❌ (pas des positions home valides)
- Deuxième condition : `-13 ≤ position ≤ -10` → accepte **-10, -11, -12, -13** ✅

**Positions valides :** -10, -11, -12, -13
**Positions acceptées :** -13 à -7 (7 positions au lieu de 4 !)

**Impact :** Un pion à la position -9 (qui est invalide) serait considéré comme "à la maison" et le joueur pourrait le faire sortir avec un 6. Cela permet des mouvements illégaux.

**Fix :** `return position <= base && position >= base - 3;`

---

### 19. ❌ `calculatePossibleMoves` dupliqué et DIVERGENT du modèle

**Fichier :** `LudoKonva.tsx` (lignes 386-459) vs `model/movement.ts`

Le frontend a DEUX systèmes de calcul de mouvements :
1. **`model/movement.ts`** : Modèle complet avec blockades, protection START_INDEX, prison
2. **`LudoKonva.tsx` inline** : Version simplifiée sans vérification des blockades

| Feature | `movement.ts` | `LudoKonva.tsx` inline |
|---------|-------------|----------------------|
| Blockade check | ✅ `hasBlockOnTrack()` | ❌ Non vérifié |
| START_INDEX protection | ✅ Vérifié | ❌ Non vérifié |
| Prison enemy check | ✅ `isInEnemyPrison()` | ✅ `isInEnemyPrison()` |
| Safe corridor | ✅ | ✅ |

**Impact :** Le frontend peut afficher un mouvement comme "possible" (highlight du pion) alors que le backend le rejettera comme invalide (blockade). L'utilisateur clique, le backend renvoie une erreur, et le joueur est frustré.

---

### 20. ⚠️ Animation de 1.5s fixe sur le dé, indépendante du réseau

**Fichier :** `DiceRoller.tsx` (lignes 187-199)

```typescript
// L'animation dure TOUJOURS 1.5s, même si le backend répond en 100ms
setTimeout(() => {
  clearInterval(animationInterval);
  setAnimationValue(data.diceValue);
  setIsRolling(false);
  onDiceRolled?.(data.diceValue);
}, 1500);
```

**Impact :** 
- Si le backend répond en 100ms : le joueur attend 1.4s inutilement
- Si le backend met 3s : l'animation s'arrête à 1.5s, le résultat n'arrive pas encore → UX bizarre

---

### 21. ⚠️ Auto-skip de 2s sans possibilité d'annuler

**Fichier :** `LudoKonva.tsx` (lignes 163-202)

Quand un joueur n'a pas de mouvement possible, le frontend auto-skip après 2 secondes sans aucune interaction possible :
```typescript
toast({ title: "No moves available", description: "Your turn will be skipped in 2 seconds..." });
const skipTimeout = setTimeout(() => {
  supabase.functions.invoke('ludo-game', { body: { action: 'skip', gameId } });
}, 2000);
```

**Impact :** Le joueur ne peut pas voir la situation, analyser les positions, ou même confirmer manuellement le skip. Pour un jeu de stratégie, c'est trop rapide.

---

### 22. ⚠️ Animation distante peut manquer des mouvements

**Fichier :** `LudoKonva.tsx` (lignes 240-299)

La détection de mouvement distant se fait par comparaison des positions :
```typescript
for (const color of colors) {
  for (let pawnIndex = 0; pawnIndex < 4; pawnIndex++) {
    if (prev[pawnIndex] !== curr[pawnIndex]) {
      foundMove = true; // Seulement le PREMIER changement trouvé
      break;
    }
  }
}
```

**Impact :** Si deux pions changent dans la même mise à jour (ex: pion capturé → prison + pion captureur → nouvelle position), seul le PREMIER mouvement est animé. La capture n'est pas visuellement représentée.

---

### 23. ⚠️ `pathGenerator.ts` - boucle infinie potentielle pour Yellow

**Fichier :** `utils/pathGenerator.ts` (lignes 49-85)

Pour Yellow avec le bug ENTRY_INDEX.Y = 28 :
```typescript
// Si startPosition = 28 (START) et endPosition = 300 (safe corridor)
while (current !== entryIndex) { // entry = 28, current = 28
  current = (current + 1) % TRACK_LEN; // N'entre jamais dans la boucle
  path.push(current);
}
```

Pour Yellow, `current === entryIndex` dès le départ, donc la boucle while ne s'exécute pas, et Yellow passe directement au safe corridor sans animation de parcours sur la piste. L'animation saute d'un coup de START au safe corridor.

---

## ERREURS UX (Expérience Utilisateur)

### 24. ⚠️ WaitingRoom auto-start seulement pour 4 joueurs exactement

**Fichier :** `LudoWaitingRoom.tsx` (lignes 158-165)

```typescript
useEffect(() => {
  const allFourConfirmed = players.length === 4 && 
    players.every(p => p.deposit_status === 'confirmed' || p.deposit_status === 'free');
  if (allFourConfirmed && !isStartingGame) {
    onStartGame();
  }
}, [players, isStartingGame, onStartGame]);
```

**Impact :** L'auto-start ne fonctionne que pour exactement 4 joueurs. Pour les parties à 2 ou 3 joueurs (`max_players = 2 ou 3`), l'auto-start ne se déclenche JAMAIS. Seul le créateur peut démarrer manuellement.

---

### 25. ⚠️ Auto-join à chaque navigation sur la page du jeu

**Fichier :** `useAutoJoin.ts`

Le hook `useAutoJoin` appelle systématiquement `ludo-game` avec `action: 'join'` à chaque fois que le composant se monte (navigation, refresh). Bien que le backend gère l'idempotence (`already_joined`), cela génère un appel API inutile à chaque visite.

---

### 26. ⚠️ Pas d'indicateur de "qui joue" clair sur mobile

Le `PlayerProfileCard` indique le tour actuel, mais sur un petit écran mobile, l'utilisateur peut ne pas voir quel joueur est en train de jouer. Le seul indicateur est un highlight subtil autour du profil.

---

### 27. ⚠️ Turn validation retry ajoute une latence inutile

**Fichier :** `turnValidation.ts` (lignes 101-129)

```typescript
export const validateTurnWithRetry = async (
  params: TurnValidationParams,
  maxRetries: number = 2,
  retryDelay: number = 500 // 500ms de délai !
) => {
```

Avant chaque lancer de dé, le frontend fait jusqu'à 3 vérifications (1 + 2 retries) avec 500ms de délai entre chaque. Cela peut ajouter jusqu'à 1 seconde de latence avant que le joueur puisse lancer le dé.

---

## PROBLÈMES DE SÉCURITÉ RLS

### 28. ⚠️ RLS `ludo_games` UPDATE : seul `created_by` peut update

```sql
-- Policy actuelle
UPDATE policy: auth.uid() = created_by
```

Le frontend ne fait pas de UPDATE direct sur `ludo_games` (tout passe par les edge functions en service_role), donc ce n'est pas bloquant. MAIS :
- Un joueur malveillant ne peut pas modifier le jeu directement ✅
- Le créateur du jeu pourrait théoriquement modifier le jeu directement (positions, winner) en contournant les edge functions ⚠️

---

## RÉSUMÉ COMPLET DES PRIORITÉS

### 🔴 CRITIQUES (Game Breaking)
| # | Erreur | Fichier |
|---|--------|---------|
| 1 | ENTRY_INDEX.Y = 28 → Yellow OP | ludoLogic.ts, ludoModel.ts |
| 2 | SAFE_LEN 5 vs 6 | Vieux ludo/ vs nouveau ludo-game/ |
| 3 | 3 edge functions conflictuelles | ludo, ludo-game, roll-dice |
| 4 | roll-dice change tour avant move | roll-dice/index.ts |
| 14 | Timer autoPlay sur TOUS les clients | TurnTimer.tsx + LudoKonva.tsx |

### 🟠 HAUTES (Functional Issues)
| # | Erreur | Fichier |
|---|--------|---------|
| 5 | ludo_increment_pot RPC manquante | check-ludo-deposits |
| 6 | current_players jamais synchronisé | handlers/create.ts, join.ts |
| 7 | Deposits bloqués (tx_hash null) | DB |
| 15 | beforeunload async ne marche pas | useRealtimeGame.ts |
| 16 | Pas de retry sur CHANNEL_ERROR | useRealtimeGame.ts |
| 18 | isAtHome accepte positions invalides | LudoKonva.tsx |
| 19 | calculatePossibleMoves divergent | LudoKonva.tsx vs movement.ts |

### 🟡 MOYENNES (UX/Logic Issues)
| # | Erreur | Fichier |
|---|--------|---------|
| 8 | Winner sans GOAL atteint | db.ts (finalizeGameIfNeeded) |
| 17 | Heartbeat 30s trop lent | useRealtimeGame.ts |
| 20 | Animation dé 1.5s fixe | DiceRoller.tsx |
| 21 | Auto-skip 2s trop rapide | LudoKonva.tsx |
| 22 | Animation manque les captures | LudoKonva.tsx |
| 23 | pathGenerator boucle skip pour Y | pathGenerator.ts |
| 24 | Auto-start uniquement pour 4 joueurs | LudoWaitingRoom.tsx |
| 27 | Turn validation retry 1s latence | turnValidation.ts |

### 🟢 BASSES (Minor Issues)
| # | Erreur | Fichier |
|---|--------|---------|
| 9-13 | Inconsistances vieux/nouveau code | Divers |
| 25 | Auto-join inutile à chaque navigation | useAutoJoin.ts |
| 26 | Indicateur de tour peu visible mobile | UI |
| 28 | RLS créateur peut UPDATE | DB policies |

---

## RECOMMANDATIONS PAR PRIORITÉ

### 🔴 Actions immédiates (P0)
1. **Corriger `ENTRY_INDEX.Y`** de 28 à **26** dans :
   - `ludo-game/ludoLogic.ts`
   - Frontend `src/features/ludo/model/ludoModel.ts`
2. **Désactiver** les edge functions `ludo` et `roll-dice`
3. **Créer la RPC `ludo_increment_pot`**
4. **Limiter autoPlay au joueur actif** : seul celui dont `currentPlayer.color === gameData.turn` appelle autoPlay

### 🟠 Actions court terme (P1)
5. **Remplacer heartbeat par Supabase Presence**
6. **Ajouter retry sur CHANNEL_ERROR** (resubscribe)
7. **Corriger `isAtHome`** : utiliser `position <= base && position >= base - 3`
8. **Utiliser `movement.ts` dans LudoKonva** au lieu du calcul inline
9. **Créer mécanisme de timeout** pour deposits bloqués

### 🟡 Actions moyen terme (P2)
10. Rendre l'animation du dé dynamique (basée sur la réponse)
11. Augmenter le délai auto-skip de 2s à 4s avec bouton "Skip maintenant"
12. Animer les captures (mouvement du capturé vers la prison)
13. Corriger auto-start pour 2-3 joueurs
14. Réduire retry validation de 500ms à 200ms
