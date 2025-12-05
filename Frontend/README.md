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
```

## 🎨 Technologies utilisées

- **React 19** - Bibliothèque UI moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS 4** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI accessibles et personnalisables
- **Radix UI** - Composants primitifs accessibles
- **Lucide React** - Icônes modernes
- **GraphQL Request** - Client GraphQL léger
- **GraphQL** - Langage de requête pour l'API

## ✨ Fonctionnalités

- ✅ Header avec navigation responsive et menu mobile
- ✅ Hero section avec statistiques et fonctionnalités
- ✅ Footer professionnel avec badges
- ✅ Design moderne avec Tailwind CSS
- ✅ Composants Shadcn/ui (Button, Card, Badge)
- ✅ Animations et transitions fluides
- ✅ **Connexion au backend GraphQL**
- ✅ Hooks personnalisés pour les requêtes GraphQL
- ✅ Accessibilité (ARIA labels, navigation clavier)
- ✅ Responsive design (mobile, tablette, desktop)

## 🔌 Connexion au Backend

Le frontend est maintenant connecté au backend GraphQL. Voici comment l'utiliser :

### Configuration

L'URL du backend est configurée dans `.env` :
```env
VITE_GRAPHQL_URL=http://localhost:5000/graphql
```

### Utilisation du hook useGraphQL

```jsx
import { useGraphQL } from '../hooks/useGraphQL'
import { GET_STATS_URGENCES } from '../lib/graphql'

function MyComponent() {
  const { data, loading, error } = useGraphQL(GET_STATS_URGENCES)
  
  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>
  
  return <div>Stats: {data?.statsUrgences}</div>
}
```

### Utilisation du hook useStats

```jsx
import { useStats } from '../hooks/useGraphQL'

function StatsComponent() {
  const { urgences, couverture, loading, error } = useStats()
  
  // ...
}
```

### Requêtes GraphQL disponibles

Toutes les requêtes sont définies dans `src/lib/graphql.js` :

- `GET_STATS_URGENCES` - Statistiques d'urgences
- `GET_STATS_COUVERTURE` - Statistiques de couverture
- `GET_URGENCES` - Liste des urgences (paginée)
- `GET_COUVERTURES` - Liste des couvertures (paginée)
- `GET_PHARMACIES` - Liste des pharmacies
- `GET_URGENCES_BY_DEPARTMENT` - Urgences par département
- `GET_COUVERTURES_BY_DEPARTMENT` - Couvertures par département

## 🎯 Composants Shadcn/ui utilisés

- **Button** - Boutons avec variantes (default, outline, ghost, etc.)
- **Card** - Cartes avec header, content, footer
- **Badge** - Badges pour tags et labels

## 🔄 Prochaines étapes

- [x] Connexion avec le backend
- [ ] Tableau de bord avec visualisations (Chart.js / Recharts)
- [ ] Page de prédictions avec graphiques interactifs
- [ ] Page d'analyse géographique avec cartes
- [ ] Intégration des données en temps réel
- [ ] Ajout de plus de composants Shadcn (Dialog, Dropdown, etc.)

## 📚 Ressources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [GraphQL Request Documentation](https://github.com/jasonkuhrt/graphql-request)

## 🐛 Dépannage

### Le backend ne répond pas

1. Vérifiez que le backend est démarré : `cd Backend/src && python app.py`
2. Vérifiez l'URL dans `.env` : `VITE_GRAPHQL_URL=http://localhost:5000/graphql`
3. Vérifiez les CORS dans le backend (doit autoriser `http://localhost:3000`)

### Erreurs CORS

Si vous voyez des erreurs CORS, assurez-vous que :
- Le backend autorise `http://localhost:3000` dans les CORS
- Le backend est bien démarré sur le port 5000
- L'URL dans `.env` est correcte
