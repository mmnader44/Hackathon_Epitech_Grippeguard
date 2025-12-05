# 🦠 GrippeGuard - Optimisation de la stratégie vaccinale contre la grippe

> Plateforme d'analyse et de prédiction pour optimiser la stratégie vaccinale contre la grippe en France

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?logo=postgresql)](https://www.postgresql.org/)

## 📋 Table des matières

- [Description](#-description)
- [Problématique](#-problématique)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Sources de données](#-sources-de-données)
- [Équipe](#-équipe)
- [Licence](#-licence)

## 🎯 Description

GrippeGuard est une plateforme innovante développée dans le cadre d'un hackathon Epitech visant à optimiser la stratégie vaccinale contre la grippe en France. Le projet exploite les données publiques ouvertes pour :

- **Prédire les besoins en vaccins** en analysant les tendances historiques
- **Optimiser la distribution** des vaccins en pharmacie
- **Anticiper les passages aux urgences** et les actes SOS Médecins
- **Améliorer l'accès aux soins** en identifiant les zones sous-vaccinées

## 🎯 Problématique

Les épidémies de grippe représentent un défi majeur pour le système de santé, nécessitant une planification rigoureuse des campagnes de vaccination et une gestion optimale des ressources médicales. GrippeGuard répond à ce défi en fournissant :

- Des modèles prédictifs pour estimer les besoins en vaccins
- Des outils de visualisation pour aider les décideurs
- Des solutions pour améliorer la distribution et l'accès aux soins

## ✨ Fonctionnalités

### 🔮 Prédictions
- Analyse des tendances historiques de couverture vaccinale
- Utilisation des Indicateurs Avancés Sanitaires (IAS®)
- Modèles prédictifs pour les besoins en vaccins

### 📊 Visualisations
- Cartes choroplèthiques interactives par département
- Graphiques d'évolution temporelle
- Analyses par classe d'âge et région
- Tableaux de bord dynamiques

### 🗺️ Optimisation géographique
- Identification des zones sous-vaccinées
- Analyse de la distribution des pharmacies
- Cartographie des besoins par région

### 🏥 Anticipation des urgences
- Prédiction des passages aux urgences
- Prévision des actes SOS Médecins
- Analyse des taux d'hospitalisation

## 🏗️ Architecture

Le projet est organisé en trois parties principales :

```
GrippeGuard/
├── Backend/          # Pipeline ETL et API
│   ├── extract.py    # Extraction des données
│   ├── transform.py  # Transformation et nettoyage
│   ├── load.py       # Chargement dans PostgreSQL
│   └── main.py       # Orchestration du pipeline
│
├── Frontend/         # Interface utilisateur React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   └── lib/         # Utilitaires
│   └── public/          # Assets statiques
│
└── Legacy/          # Version prototype (Dash)
    └── app.py       # Application Dash originale
```

### Pipeline de données

1. **Extract** : Téléchargement des données depuis les APIs publiques
2. **Transform** : Nettoyage, normalisation et enrichissement
3. **Load** : Stockage dans PostgreSQL pour analyse

## 🛠️ Technologies

### Frontend
- **React 19** - Bibliothèque UI moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS 4** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI accessibles
- **Radix UI** - Primitives accessibles
- **Lucide React** - Icônes modernes

### Backend
- **Python 3.x** - Langage principal
- **PostgreSQL** - Base de données relationnelle
- **Docker** - Conteneurisation
- **Pandas** - Traitement de données
- **PyYAML** - Configuration

### Infrastructure
- **Docker Compose** - Orchestration des services
- **PostgreSQL** - Base de données
- **Nginx** (optionnel) - Reverse proxy

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- Python 3.9+
- Docker et Docker Compose
- Git

### Installation du Frontend

```bash
cd Frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Installation du Backend

```bash
cd Backend
pip install -r requirements.txt
```

### Lancement avec Docker

```bash
docker-compose up -d
```

## 🚀 Utilisation

### Développement Frontend

```bash
cd Frontend
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualisation du build
```

### Exécution du pipeline ETL

```bash
cd Backend
python main.py
```

### Configuration

Le fichier `Backend/config.yaml` contient toutes les configurations :
- URLs des sources de données
- Paramètres de connexion PostgreSQL
- Chemins de sortie

## 📁 Structure du projet

```
T-HAK-700-NAN_3/
├── Backend/
│   ├── config.yaml          # Configuration du pipeline
│   ├── docker-compose.yml   # Services Docker
│   ├── Dockerfile           # Image Docker
│   ├── extract.py           # Extraction des données
│   ├── transform.py         # Transformation
│   ├── load.py              # Chargement
│   ├── main.py              # Point d'entrée
│   └── requirements.txt     # Dépendances Python
│
├── Frontend/
│   ├── src/
│   │   ├── components/      # Composants React
│   │   │   ├── ui/          # Composants Shadcn/ui
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/           # Pages
│   │   │   └── Home.jsx
│   │   ├── lib/             # Utilitaires
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/             # Assets
│   ├── package.json
│   └── vite.config.js
│
├── Legacy/                  # Version prototype
│   ├── app.py              # Application Dash
│   ├── requirements.txt
│   └── GoogleCollab_Explo/ # Notebooks d'exploration
│
└── README.md               # Ce fichier
```

## 📊 Sources de données

Le projet utilise plusieurs sources de données publiques :

### Santé Publique France
- **Passages aux urgences** : [Données départementales](https://odisse.santepubliquefrance.fr/explore/dataset/grippe-passages-aux-urgences-et-actes-sos-medecins-departement/)
- **Couverture vaccinale** : [Données départementales](https://odisse.santepubliquefrance.fr/explore/dataset/couvertures-vaccinales-des-adolescent-et-adultes-departement/)
- **Données régionales et nationales** : Disponibles via l'API Odisse

### IQVIA
- **Distribution de vaccins** : [Datasets IQVIA](https://www.data.gouv.fr/organizations/iqvia-france/datasets)
- **Actes de vaccination en pharmacie**

### Data.gouv.fr
- **Indicateur Avancé Sanitaire (IAS®)** : [Dataset IAS](https://www.data.gouv.fr/datasets/indicateur-avance-sanitaire-ias-r-vaccination-grippe/)
- **Données géographiques** : GeoJSON des départements français

## 👥 Équipe

Développé par l'équipe Epitech :

- **Mehdi**
- **Samy**
- **Robin**
- **Salah**
- **Jaures**

## 🎯 Objectifs du hackathon

Ce projet répond aux critères d'évaluation suivants :

- ✅ **Pertinence** des solutions proposées
- ✅ **Innovation** et originalité des approches
- ✅ **Impact potentiel** sur la santé publique
- ✅ **Qualité** de la visualisation et présentation

## 🔄 Prochaines étapes

- [ ] Connexion Frontend ↔ Backend
- [ ] Implémentation complète du pipeline ETL
- [ ] Modèles de machine learning pour prédictions
- [ ] API REST/GraphQL
- [ ] Authentification utilisateurs
- [ ] Export de rapports PDF
- [ ] Notifications en temps réel
- [ ] Application mobile (optionnel)

## 📝 Licence

Ce projet est développé dans le cadre d'un hackathon Epitech. Voir le fichier `LICENSE` pour plus d'informations.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le repository
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur le repository.

---

**Développé avec ❤️ pour améliorer la santé publique**

