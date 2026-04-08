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

## Résumé des priorités de correction

| # | Sévérité | Erreur | Impact |
|---|----------|--------|--------|
| 1 | 🔴 CRITIQUE | ENTRY_INDEX.Y = 28 au lieu de 26 | Yellow OP, jeu déséquilibré |
| 2 | 🔴 CRITIQUE | SAFE_LEN = 5 vs 6 | État de jeu corrompu |
| 3 | 🔴 CRITIQUE | 3 edge functions conflictuelles actives | État de jeu corrompu |
| 4 | 🔴 CRITIQUE | roll-dice change le tour avant le move | Jeu injouable si appelé |
| 5 | 🟠 HAUTE | ludo_increment_pot RPC manquante | Pot jamais incrémenté (jeux payants cassés) |
| 6 | 🟠 HAUTE | current_players jamais synchronisé | Compteur joueurs faux |
| 7 | 🟠 HAUTE | Pending deposits bloqués (tx_hash null) | Joueurs coincés |
| 8 | 🟡 MOYENNE | Winner sans GOAL atteint | UX confuse |
| 9 | 🟡 MOYENNE | Pas de protection START_INDEX (old) | Capture injuste (old fn) |
| 10-13 | 🟢 BASSE | Inconsistances mineures | Maintenance |

---

## Recommandations

### Actions immédiates :
1. **Désactiver** les edge functions `ludo` et `roll-dice` (les remplacer par des redirections vers `ludo-game` ou les supprimer)
2. **Corriger `ENTRY_INDEX.Y`** de 28 à 26 dans `ludo-game/ludoLogic.ts` ET le frontend `ludoModel.ts`
3. **Créer la fonction RPC `ludo_increment_pot`** pour que `check-ludo-deposits` fonctionne
4. **Ajouter un mécanisme de timeout** pour les jeux avec `deposit_status=pending` et `tx_hash=null`

### Actions court terme :
5. Synchroniser `current_players` dans les handlers create/join/exit
6. Nettoyer les données incohérentes en base
7. Ajouter des logs de monitoring pour détecter les appels aux anciennes fonctions
