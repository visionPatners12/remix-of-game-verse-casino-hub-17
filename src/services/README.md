
# Services Infrastructure

## Architecture Simplifiée

### ✅ Existant et Consolidé
- **database/** - Services Supabase (queries, mutations)
- **api/** - Clients HTTP et endpoints
- **index.ts** - Barrel exports pour tous les services

### Structure Standard
```
src/services/
├── index.ts              # Barrel exports
├── database/            
│   ├── index.ts         # Database services exports
│   ├── queries.ts       # Select operations
│   └── mutations.ts     # Insert/Update/Delete operations
└── api/
    ├── index.ts         # API services exports
    ├── httpClient.ts    # HTTP client configuration
    └── endpoints.ts     # API endpoints mapping
```

## Utilisation
```typescript
// Import centralisé depuis services
import { userQueries, gameQueries } from '@/services';
import { apiClient, endpoints } from '@/services';
```

## Principe de Simplicité
- Un service = une responsabilité
- Éviter les abstractions inutiles
- Privilégier la lisibilité à la complexité
