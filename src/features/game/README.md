# Game Feature

Cette feature gère l'ensemble des jeux disponibles dans l'application.

## 🏗️ Structure

```
src/features/game/
├── games/              # Dossier contenant les différents jeux
├── types.ts           # Types partagés pour tous les jeux
├── constants.ts       # Constantes communes
├── index.ts          # Point d'entrée principal
└── README.md         # Documentation
```

## 🎮 Jeux Disponibles

Les jeux seront implémentés dans le dossier `games/`:
- `games/ludo/` - Jeu du Ludo
- `games/[autre-jeu]/` - Futurs jeux

## 📝 Types Principaux

- `GameConfig` : Configuration d'un jeu
- `GameState` : État général d'une partie
- `Player` : Informations d'un joueur

## 🎯 Utilisation

```typescript
import { GameConfig, GAME_CONSTANTS } from '@/features/game';
```