
# Utils Infrastructure

## Architecture Simplifiée

### ✅ Existant et Consolidé
- **formatters.ts** - Formatage dates, devises, texte
- **validators.ts** - Validations (à créer)
- **helpers.ts** - Fonctions utilitaires générales
- **index.ts** - Barrel exports + cn utility

### Structure Standard
```
src/utils/
├── index.ts          # Barrel exports + cn utility
├── formatters.ts     # Date, currency, text formatting
├── validators.ts     # Input validation functions
├── helpers.ts        # General helper functions
└── constants.ts      # Application constants
```

## Utilisation
```typescript
// Import centralisé depuis utils
import { formatCurrency, formatDate } from '@/utils';
import { validateEmail, validatePhone } from '@/utils';
import { generateId, debounce, cn } from '@/utils';
```

## Principe de Simplicité
- Fonctions pures privilégiées
- Éviter les dépendances complexes
- Une fonction = une responsabilité
