
# Feature Template

Ce template standardise la création de nouvelles features dans l'application.

## 🏗️ Structure de Feature

```
src/features/my-feature/
├── components/          # Composants React de la feature
│   ├── MyComponent.tsx
│   └── index.ts        # Exports des composants
├── hooks/              # Hooks spécialisés
│   ├── useMyHook.ts
│   └── index.ts
├── services/           # Services et API calls
│   ├── myService.ts
│   └── index.ts
├── types.ts           # Types TypeScript de la feature
├── utils.ts           # Utilitaires spécifiques
├── constants.ts       # Constantes de la feature
├── index.ts          # Point d'entrée principal
└── README.md         # Documentation de la feature
```

## 📝 Template Files

### src/features/my-feature/index.ts
```typescript
// My Feature - Main exports

// Components
export { MyComponent } from './components/MyComponent';

// Hooks
export { useMyHook } from './hooks/useMyHook';

// Types
export type { MyFeatureData } from './types';

// Services
export { myService } from './services/myService';
```

### src/features/my-feature/types.ts
```typescript
export interface MyFeatureData {
  id: string;
  name: string;
  // ... autres propriétés
}

export interface MyFeatureState {
  isLoading: boolean;
  data: MyFeatureData[];
  error: string | null;
}
```

### src/features/my-feature/components/MyComponent.tsx
```typescript
import React from 'react';
import { useMyHook } from '../hooks/useMyHook';
import type { MyFeatureData } from '../types';

interface MyComponentProps {
  data?: MyFeatureData;
  onAction?: () => void;
}

export const MyComponent = ({ data, onAction }: MyComponentProps) => {
  const { state, actions } = useMyHook();

  return (
    <div className="my-component">
      {/* Implémentation du composant */}
    </div>
  );
};
```

### src/features/my-feature/hooks/useMyHook.ts
```typescript
import { useState, useEffect } from 'react';
import type { MyFeatureState } from '../types';
import { myService } from '../services/myService';

export const useMyHook = () => {
  const [state, setState] = useState<MyFeatureState>({
    isLoading: false,
    data: [],
    error: null
  });

  const actions = {
    fetchData: async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const data = await myService.fetchData();
        setState(prev => ({ ...prev, data, isLoading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          isLoading: false 
        }));
      }
    }
  };

  return { state, actions };
};
```

## ✅ Checklist de Création

- [ ] Créer la structure de dossiers
- [ ] Implémenter les types TypeScript
- [ ] Créer les composants principaux
- [ ] Développer les hooks personnalisés
- [ ] Ajouter les services/API calls
- [ ] Écrire les tests unitaires
- [ ] Documenter la feature
- [ ] Mettre à jour les exports globaux
- [ ] Vérifier les imports optimisés

## 🎯 Bonnes Pratiques

1. **Modularité** : Chaque feature doit être autonome
2. **Types** : Utiliser TypeScript rigoureusement
3. **Barrel Exports** : Un seul index.ts comme point d'entrée
4. **Documentation** : README détaillé pour chaque feature
5. **Tests** : Coverage minimale de 80%
6. **Performance** : Lazy loading et code splitting
