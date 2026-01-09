# Live Streaming Feature

Cette feature implémente un système complet de streaming live utilisant GetStream Video SDK et React.

## Structure

```
src/features/live/
├── components/
│   ├── creation/
│   │   └── LiveCreationForm.tsx    # Formulaire de création de stream
│   ├── forms/                      # Composants de formulaire réutilisables
│   │   ├── InputField.tsx
│   │   ├── TextAreaField.tsx
│   │   ├── HashtagsField.tsx
│   │   ├── DateTimePicker.tsx
│   │   └── ToggleSwitch.tsx
│   ├── host/
│   │   └── StreamHostPage.tsx      # Page principale pour l'hôte
│   ├── viewer/
│   │   └── StreamViewerPage.tsx    # Page pour les spectateurs
│   └── index.ts                    # Exports des composants
├── hooks/
│   ├── useStreamCreation.ts        # Hook pour créer un stream
│   ├── useStreamHost.ts            # Hook pour gérer l'hôte
│   ├── useStreamViewer.ts          # Hook pour gérer les spectateurs
│   └── index.ts
├── services/
│   ├── streamService.ts            # Service de gestion des streams
│   ├── videoCallService.ts         # Service GetStream Video
│   └── index.ts
├── types/
│   ├── stream.ts                   # Types TypeScript
│   └── index.ts
└── index.ts                        # Export principal
```

## Routes configurées

- `/stream/:callId/host` - Page pour l'hôte qui diffuse
- `/stream/:callId/view` - Page pour les spectateurs (alias)  
- `/stream/:callId` - Page pour les spectateurs

## Fonctionnalités

### Création de Stream
- Formulaire complet avec titre, description, hashtags
- Association optionnelle avec des matchs sportifs
- Gestion de la visibilité (public/privé)
- Navigation automatique vers la page hôte

### Page Hôte
- Interface complète avec contrôles vidéo
- Démarrage/arrêt du stream
- Gestion caméra et microphone
- Affichage du nombre de spectateurs
- Statut live en temps réel

### Page Spectateur
- Visualisation du stream
- Contrôles de volume et plein écran
- Affichage du statut live
- Compteur de spectateurs

## Utilisation

```tsx
import { LiveCreationForm, StreamHostPage, StreamViewerPage } from '@/features/live';

// Dans CreateLivePage.tsx
<LiveCreationForm selectedMatch={selectedMatch} />

// Les routes sont automatiquement configurées
// Navigation vers /stream/callId/host après création
```

## Services

- `streamService` - Gestion des streams en base de données
- `videoCallService` - Interface avec GetStream Video SDK
- `tokenService` - Gestion des tokens GetStream (déjà existant)

## TODO

- [ ] Implémenter la table `live_streams` en base
- [ ] Ajouter le chat en temps réel
- [ ] Gestion des permissions avancées
- [ ] Statistiques détaillées
- [ ] Enregistrement des streams