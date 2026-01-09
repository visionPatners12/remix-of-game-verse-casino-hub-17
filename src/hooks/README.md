
# Hooks Infrastructure

## Architecture Simplifiée

### ✅ Existant et Consolidé
- **useWindowSize.ts** - Hook pour taille fenêtre
- **useMediaQuery.ts** - Hook pour media queries
- **useDebounce.ts** - Hook de debouncing
- **useLocalStorage.ts** - Hook pour localStorage
- **index.ts** - Barrel exports pour tous les hooks

### Structure Standard
```
src/hooks/
├── index.ts              # Barrel exports
├── useWindowSize.ts      # Window size management
├── useMediaQuery.ts      # Responsive design
├── useDebounce.ts        # Input debouncing
├── useLocalStorage.ts    # Local storage management
└── useAuth.ts           # Authentication (à créer si nécessaire)
```

## Utilisation
```typescript
// Import centralisé depuis hooks
import { useWindowSize, useMediaQuery } from '@/hooks';
import { useDebounce, useLocalStorage } from '@/hooks';
```

## Principe de Simplicité
- Hooks réutilisables et composables
- Logique métier séparée des composants
- Tests unitaires facilitées
