
# Types Infrastructure

## Architecture Simplifiée

### ✅ Existant et Consolidé
- **common.ts** - Types de base (BaseEntity, ApiResponse, etc.)
- **api.ts** - Types API (RequestConfig, ApiError)
- **user.ts** - Types utilisateur (User, UserProfile, UserStats)
- **index.ts** - Barrel exports pour tous les types

### Structure Standard
```
src/types/
├── index.ts          # Barrel exports
├── common.ts         # Types de base partagés
├── api.ts           # Types API et HTTP
├── user.ts          # Types utilisateur
└── database.ts      # Types database (à créer si nécessaire)
```

## Utilisation
```typescript
// Import centralisé depuis types
import { BaseEntity, ApiResponse, User } from '@/types';
import { RequestConfig, ApiError } from '@/types';
```

## Principe de Simplicité
- Types réutilisables et composables
- Éviter la duplication de types
- Nomenclature cohérente
