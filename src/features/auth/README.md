
# Auth Feature

Cette feature gère l'authentification et l'inscription des utilisateurs.

## Structure

```
src/features/auth/
├── components/          # Composants d'authentification
│   ├── EnhancedLoginForm.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── WalletConnectForm.tsx
│   └── ReferralCodeDisplay.tsx
├── forms/              # Formulaires (à migrer depuis components/auth/forms/)
├── hooks/              # Hooks spécialisés
│   ├── useOnboardingRedirect.ts
│   └── useSignupForm.ts
├── types.ts           # Types pour l'authentification
└── index.ts          # Exports publics
```

## Usage

```typescript
import { 
  EnhancedLoginForm, 
  SignupForm, 
  WalletConnectForm,
  useSignupForm 
} from '@/features/auth';
```

## Status

✅ **Migré** - Structure de base créée
🔄 **En cours** - Migration des sous-composants (forms/, fields/, signup/)
