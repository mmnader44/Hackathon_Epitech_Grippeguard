# GrippeGuard - Frontend

Interface web moderne pour l'optimisation de la stratégie vaccinale contre la grippe.

## 🚀 Démarrage rapide

### Installation des dépendances

```bash
npm install
```

### Configuration

Créez un fichier `.env` à la racine du dossier Frontend :

```env
VITE_GRAPHQL_URL=http://localhost:5000/graphql
```

### Lancement du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

**Important** : Assurez-vous que le backend est démarré sur le port 5000 avant de lancer le frontend.

### Build de production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants Shadcn/ui
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   └── badge.jsx
│   ├── Header.jsx      # En-tête avec navigation
│   ├── Hero.jsx       # Section hero principale
│   ├── Footer.jsx     # Pied de page
│   └── StatsCard.jsx  # Composant de statistiques (exemple d'intégration backend)
├── hooks/              # Hooks React personnalisés
│   └── useGraphQL.js  # Hook pour requêtes GraphQL
├── lib/                # Utilitaires
│   ├── utils.js       # Fonctions utilitaires (cn)
│   └── graphql.js     # Client GraphQL et requêtes
├── pages/              # Pages de l'application
│   └── Home.jsx       # Page d'accueil
├── App.jsx            # Composant racine
└── main.jsx           # Point d'entrée
# GrippeGuard — Frontend

Interface React (Vite) du projet. Ce README corrige et précise les informations d'exécution et de configuration.

## Démarrage rapide (PowerShell)

1. Installer les dépendances et démarrer le serveur de développement :

```powershell
cd Frontend
npm install
npm run dev
```

Vite démarre typiquement sur `http://localhost:5173` (ou `http://localhost:3000` selon la configuration).

2. Configurer l'URL du backend GraphQL :

Créez/éditez le fichier `Frontend/.env` et définissez `VITE_GRAPHQL_URL` vers l'API Flask. Exemple :

```env
VITE_GRAPHQL_URL=http://localhost:5001/graphql
```

Le backend par défaut écoute sur le port `5001` (voir `Backend/src/app.py`).

## Commandes utiles

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build

## Structure principale (`src/`)

- `components/` — composants réutilisables (dont `ui/` pour composants partagés)
- `hooks/` — hooks React personnalisés (`useGraphQL.js` pour interroger l'API)
- `lib/` — utilitaires (`graphql.js` contient les requêtes utilisées)
- `pages/` — pages principales (`Dashboard.jsx`, `Prediction.jsx`)

## Connexion au backend

- L'URL GraphQL est définie via `VITE_GRAPHQL_URL` dans `Frontend/.env`.
- Exemple d'utilisation du hook `useGraphQL` (simplifié) :

```jsx
import { useGraphQL } from './hooks/useGraphQL'
import { GET_STATS_URGENCES } from './lib/graphql'

function MyComponent() {
  const { data, loading, error } = useGraphQL(GET_STATS_URGENCES)
  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>
  return <div>Stats: {data?.statsUrgences}</div>
}
```

## Dépannage rapide

- Si le frontend ne récupère pas de données : assurez-vous que l'API GraphQL est démarrée (`Backend/src/app.py`) et que `VITE_GRAPHQL_URL` pointe vers `http://localhost:5001/graphql`.
- En cas d'erreur CORS, vérifiez la configuration CORS dans `Backend/src/app.py`.

Si vous voulez, j'ajoute ici des exemples de requêtes GraphQL à coller dans GraphiQL.
