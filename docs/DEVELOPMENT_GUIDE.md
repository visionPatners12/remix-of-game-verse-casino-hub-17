
# Guide de Développement - Architecture Features

## 🎯 Vue d'Ensemble

Ce guide explique comment développer efficacement avec la nouvelle architecture basée sur les features modulaires.

## 🚀 Démarrage Rapide

### Créer une Nouvelle Feature

1. **Générer la structure** :
```bash
mkdir -p src/features/my-feature/{components,hooks,services}
touch src/features/my-feature/{index.ts,types.ts,README.md}
```

2. **Utiliser le template** : Copier depuis `docs/feature-template/`

3. **Implémenter la logique** : Suivre les patterns établis

### Ajouter un Composant à une Feature Existante

```typescript
// src/features/auth/components/NewAuthComponent.tsx
export const NewAuthComponent = () => {
  return <div>Nouveau composant</div>;
};

// src/features/auth/components/index.ts
export { NewAuthComponent } from './NewAuthComponent';

// src/features/auth/index.ts
export { NewAuthComponent } from './components';
```

## 📦 Stratégie d'Imports

### Hiérarchie des Imports
1. **Features** (priorité max) : `@/features/[feature]`
2. **UI Components** : `@/components/ui/[component]`
3. **Services globaux** : `@/services`
4. **Utils/Hooks** : `@/utils`, `@/hooks`

### Exemples Concrets

```typescript
// ✅ Pattern optimal
import { LoginForm, useAuth } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services';

// ❌ Pattern à éviter
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
```

## 🏗️ Patterns de Développement

### 1. Composants avec State Management

```typescript
// Feature hook pattern
export const useMyFeature = () => {
  const [state, setState] = useState(initialState);
  
  const actions = {
    updateData: (data) => setState(prev => ({ ...prev, data })),
    resetState: () => setState(initialState)
  };
  
  return { state, actions };
};

// Component utilisant le hook
export const MyComponent = () => {
  const { state, actions } = useMyFeature();
  return <div>{/* JSX */}</div>;
};
```

### 2. Services avec API Integration

```typescript
// src/features/my-feature/services/myService.ts
import { apiClient } from '@/services';
import type { MyFeatureData } from '../types';

export const myService = {
  async fetchData(): Promise<MyFeatureData[]> {
    const { data } = await apiClient.get('/api/my-feature');
    return data;
  },
  
  async createItem(item: Partial<MyFeatureData>): Promise<MyFeatureData> {
    const { data } = await apiClient.post('/api/my-feature', item);
    return data;
  }
};
```

### 3. Types et Interfaces

```typescript
// src/features/my-feature/types.ts
export interface MyFeatureData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface MyFeatureState {
  items: MyFeatureData[];
  loading: boolean;
  error: string | null;
}

export type MyFeatureAction = 
  | 'create'
  | 'update' 
  | 'delete';
```

## 🧪 Testing Strategy

### Structure des Tests
```
src/features/my-feature/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── services/
```

### Exemple de Test
```typescript
// src/features/auth/__tests__/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

test('renders login form correctly', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

## 🔧 Tools et Utilitaires

### VS Code Snippets
Créer des snippets pour accélérer le développement :

```json
{
  "React Feature Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:Component}Props {",
      "  ${2:prop}: ${3:string};",
      "}",
      "",
      "export const ${1:Component} = ({ ${2:prop} }: ${1:Component}Props) => {",
      "  return (",
      "    <div className=\"${4:classname}\">",
      "      ${5:content}",
      "    </div>",
      "  );",
      "};",
      ""
    ]
  }
}
```

### ESLint Rules Recommandées
```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@/components/**"],
            "message": "Prefer importing from @/features or @/components/ui"
          }
        ]
      }
    ]
  }
}
```

## 📊 Métriques de Qualité

### KPIs à Surveiller
- **Bundle Size** par feature
- **Coverage** de tests (>80%)
- **Cyclomatic Complexity** (<10)
- **Import Depth** (<4 niveaux)

### Outils de Mesure
```bash
# Analyser la taille des bundles
npm run build:analyze

# Coverage des tests
npm run test:coverage

# Complexité du code
npm run lint:complexity
```

## 🎨 Style Guide

### Conventions de Nommage
- **Features** : kebab-case (`my-feature`)
- **Composants** : PascalCase (`MyComponent`)
- **Hooks** : camelCase with `use` (`useMyHook`)
- **Types** : PascalCase (`MyFeatureData`)

### Organisation des Fichiers
- Garder les fichiers <200 lignes
- Un composant par fichier
- Grouper les exports dans index.ts

## 🚨 Troubleshooting

### Problèmes Courants

1. **Import Circulaire** : Vérifier les deps avec `madge`
2. **Bundle Trop Gros** : Utiliser code splitting
3. **Tests Lents** : Isoler les tests par feature

### Commandes Utiles
```bash
# Détecter les imports circulaires
npx madge --circular src/

# Analyser les dépendances
npx dependency-cruiser src/

# Bundle analyzer
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```
