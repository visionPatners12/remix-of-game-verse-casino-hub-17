# Component Standardization Guide

## 🎯 Objectifs

- **Cohérence** : Tous les composants suivent les mêmes patterns
- **Productivité** : Génération automatique avec les bonnes structures
- **Maintenabilité** : Code prévisible et facile à maintenir
- **Qualité** : Réduction des erreurs grâce à la standardisation

## 📋 Patterns Standardisés

### 1. **Component Pattern**

```typescript
interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const ComponentName = ({
  className,
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick
}: ComponentNameProps) => {
  return (
    <div className={cn(baseStyles, variantStyles, sizeStyles, className)}>
      {children}
    </div>
  );
};
```

### 2. **Hook Pattern**

```typescript
export const useFeatureName = () => {
  const [state, setState] = useState<FeatureState>({
    isLoading: false,
    data: [],
    error: null
  });

  const actions = useMemo(() => ({
    fetchData: async () => { /* implementation */ },
    updateItem: (id: string, updates: Partial<Data>) => { /* implementation */ }
  }), []);

  return {
    state,
    actions,
    // Computed values
    isEmpty: state.data.length === 0,
    isReady: !state.isLoading && !state.error
  };
};
```

### 3. **Service Pattern**

```typescript
export const featureService = {
  async getAll(): Promise<Data[]> {
    try {
      const response = await fetch('/api/feature');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },

  async create(data: CreateRequest): Promise<Data> { /* implementation */ },
  async update(id: string, updates: Partial<Data>): Promise<Data> { /* implementation */ },
  async delete(id: string): Promise<void> { /* implementation */ }
};
```

## 🛠️ Outils de Génération

### Génération de Composant
```bash
node scripts/generate-component.js MyComponent [src/components/MyComponent]
```

### Génération de Hook
```bash
node scripts/generate-hook.js useMyFeature [src/hooks]
```

### Génération de Service
```bash
node scripts/generate-service.js MyFeature [src/services]
```

### Génération de Feature Complète
```bash
node scripts/generate-feature.js MyFeature [src/features/my-feature]
```

## 📁 Structure de Feature

```
src/features/my-feature/
├── components/          # Composants React
│   ├── MyFeatureList/
│   ├── MyFeatureCard/
│   ├── MyFeatureForm/
│   └── index.ts        # Barrel exports
├── hooks/              # Hooks spécialisés
│   ├── useMyFeature.ts
│   └── index.ts
├── services/           # Services API
│   ├── myFeatureService.ts
│   └── index.ts
├── types.ts           # Types TypeScript
├── index.ts          # Point d'entrée public
└── README.md         # Documentation
```

## ✅ Règles de Cohérence

### Props et Interfaces
- **Toujours** définir une interface `ComponentNameProps`
- **Inclure** `className?: string` pour la personnalisation
- **Utiliser** des variants et sizes standardisés
- **Gérer** les états `disabled` et `loading`

### Exports et Imports
- **Utiliser** des barrel exports (`index.ts`) pour chaque feature
- **Grouper** les exports par type (components, hooks, types, services)
- **Préférer** les imports depuis les features plutôt que les chemins profonds

### Types TypeScript
- **Séparer** les types dans `types.ts` pour chaque feature
- **Utiliser** des interfaces plutôt que des types pour les objets
- **Préfixer** les interfaces avec le nom de la feature

### Styles et Design
- **Utiliser** les tokens du design system (variables CSS)
- **Éviter** les couleurs hardcodées (`text-white`, `bg-black`)
- **Préférer** les classes sémantiques (`text-primary`, `bg-secondary`)
- **Inclure** les variants responsive et dark mode

## 🎨 Design System Integration

```typescript
// ✅ CORRECT - Utilisation des tokens du design system
<Button 
  variant="primary" 
  size="md" 
  className="shadow-elegant hover:shadow-glow"
>

// ❌ INCORRECT - Couleurs hardcodées
<Button 
  className="bg-blue-500 text-white hover:bg-blue-600"
>
```

## 📊 Métriques de Qualité

- **Cohérence** : 100% des nouveaux composants suivent les patterns
- **Couverture** : 80% minimum de tests pour les composants
- **Performance** : Utilisation de `React.memo` pour les composants optimisés
- **Documentation** : README présent pour chaque feature

## 🔧 ESLint Rules (à implémenter)

```javascript
// Custom rules pour enforcer les patterns
rules: {
  'component-props-interface': 'error',
  'barrel-exports-required': 'error',
  'no-hardcoded-colors': 'error',
  'hook-return-pattern': 'error'
}
```

## 📖 Exemples d'Usage

### Création d'une nouvelle feature
```bash
# Génère la structure complète
node scripts/generate-feature.js Notifications

# Résultat :
# src/features/notifications/
# ├── components/NotificationsList/, NotificationsCard/, NotificationsForm/
# ├── hooks/useNotifications.ts
# ├── services/notificationsService.ts
# └── types.ts, index.ts, README.md
```

### Import standardisé
```typescript
// Import depuis la feature
import { 
  NotificationsList, 
  useNotifications, 
  notificationsService 
} from '@/features/notifications';

// Utilisation
const { state, actions } = useNotifications();
```

Cette standardisation garantit la cohérence, améliore la productivité et facilite la maintenance du code.