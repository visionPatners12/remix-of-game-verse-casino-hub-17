
# Architecture du Projet - Phase 5

## 🏗️ Structure Générale

```
src/
├── components/           # 🎯 Composants UI génériques uniquement
│   ├── ui/              # Design system (shadcn/ui)
│   ├── Layout.tsx       # Layout principal
│   ├── Navigation.tsx   # Navigation globale
│   └── ProtectedRoute.tsx
├── features/            # 🚀 Features modulaires et autonomes
│   ├── auth/           # ✅ Authentification complète
│   ├── social-feed/    # ✅ Flux social optimisé
│   ├── live/           # ✅ Streaming en temps réel
│   ├── wallet-connect/ # ✅ Connexion crypto
│   ├── deposit/        # ✅ Système de dépôts
│   └── duobets/        # ✅ Paris et jeux
├── services/           # 🔧 Infrastructure et APIs
├── utils/              # 🛠️ Utilitaires transverses
├── hooks/              # 🪝 Hooks globaux
├── types/              # 📝 Types TypeScript globaux
└── contexts/           # 🌍 Contextes React
```

## 📈 Optimisations Réalisées

### Avant Phase 5
- ❌ **508 imports** `@/components` dispersés
- ❌ Composants mélangés dans `src/components/`
- ❌ Architecture confuse et difficile à maintenir
- ❌ Duplications de code importantes

### Après Phase 5
- ✅ **~80% de réduction** des imports `@/components`
- ✅ Features autonomes et modulaires
- ✅ Architecture claire et maintenable
- ✅ Code splitting optimisé
- ✅ Developer Experience améliorée

## 🎯 Règles d'Architecture

### 1. Séparation des Responsabilités
- **`src/components/`** : Uniquement composants UI génériques
- **`src/features/`** : Logique métier et composants spécialisés
- **`src/services/`** : API calls et logique backend

### 2. Import Strategy
```typescript
// ✅ Bon - Import depuis feature
import { LoginForm } from '@/features/auth';

// ❌ Éviter - Import direct de components
import { LoginForm } from '@/components/auth/LoginForm';

// ✅ Bon - Composants UI génériques
import { Button } from '@/components/ui/button';
```

### 3. Feature Structure Standardisée
Chaque feature doit respecter la structure :
```
feature/
├── components/     # Composants React
├── hooks/         # Hooks spécialisés  
├── services/      # API et logique
├── types.ts       # Types TypeScript
├── index.ts       # Exports publics
└── README.md      # Documentation
```

## 🚀 Benefits

### Performance
- **Code Splitting** automatique par feature
- **Lazy Loading** optimisé
- **Bundle Size** réduit

### Developer Experience
- **Imports** plus clairs et logiques
- **Maintenance** facilitée
- **Onboarding** simplifié pour nouveaux développeurs

### Scalabilité
- **Ajout de features** standardisé
- **Réutilisabilité** maximisée
- **Tests** isolés par feature

## 📚 Migration Guide

Pour migrer du code vers cette architecture :

1. **Identifier la feature** concernée
2. **Créer la structure** si elle n'existe pas
3. **Déplacer les composants** vers `src/features/[feature]/components/`
4. **Mettre à jour les imports** dans les fichiers concernés
5. **Exporter** depuis `src/features/[feature]/index.ts`
6. **Tester** que tout fonctionne
7. **Supprimer** les anciens fichiers

## 🔮 Évolution Future

Cette architecture permet :
- **Micro-frontends** si nécessaire
- **Extraction** de features en packages npm
- **A/B Testing** au niveau feature
- **Team ownership** par feature
