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
 # GrippeGuard — README

Plateforme créée dans le cadre d'un hackathon Epitech pour analyser et visualiser des données liées à la grippe en France (ETL, API GraphQL, frontend React, scripts ML).

**But de ce README** : décrire l'architecture réelle du dépôt, expliquer comment lancer les composants et où se trouvent les scripts importants.

**Organisation principale du dépôt**

- `Backend/` : pipeline ETL, API (Flask + GraphQL), scripts ML et utilitaires Python.
- `Frontend/` : application React (Vite) pour visualiser les données et interagir avec l'API GraphQL.
- `Legacy/` : prototype/démonstrateur (Dash + notebooks) conservé pour référence.

**Résumé rapide — commandes utiles**

- Installer les dépendances Python (backend) :

```powershell
cd Backend
python -m pip install -r requirements.txt
```

- Lancer le pipeline ETL et générer les fichiers propres :

```powershell
cd Backend
python src/main.py
```

- Lancer l'API GraphQL (serveur Flask) :

```powershell
cd Backend
python src/app.py
```

    Le serveur GraphQL écoute par défaut sur le port `5001` (variable `GRAPHQL_PORT`) et expose l'endpoint `/graphql`.

- Lancer le frontend (développement) :

```powershell
cd Frontend
npm install
npm run dev
```

    Par défaut Vite démarre sur `http://localhost:5173` ou `http://localhost:3000` selon votre configuration. Le frontend attend l'API GraphQL sur l'URL configurée dans `.env` (voir `Frontend/README.md`).

**Détails importants sur le fonctionnement**

- ETL (Backend/src/main.py) :
    - `main.py` orchestre `extract.py`, `transform.py` et `load.py`.
    - `config.yaml` (à la racine de `Backend/`) contient les URLs et chemins de sortie.
    - Exécution génère des fichiers nettoyés dans le répertoire `data/clean` (ou celui configuré dans `config.yaml`).

- API (Backend/src/app.py) :
    - Serveur Flask exposant un endpoint `/graphql` utilisant le schéma défini dans `Backend/src/schema.py`.
    - CORS configuré pour autoriser l'accès depuis le frontend local.
    - Le frontend utilise typiquement `http://localhost:5001/graphql` comme endpoint GraphQL.

- ML (Backend/ml/) :
    - `preprocess.py`, `model.py`, `predict.py` et `run_real_test.py` contiennent les étapes de prétraitement, entraînement et prédiction.
    - Les modèles et résultats peuvent être exportés/chargés via `joblib`/`pickle` selon les scripts.

**Structure concise des dossiers**

```
.
├── Backend/
│   ├── config.yaml
│   ├── requirements.txt
│   ├── data/
│   │   ├── raw/
│   │   └── clean/
│   ├── ml/
│   │   ├── model.py
│   │   ├── predict.py
│   │   └── preprocess.py
│   └── src/
│       ├── app.py        # API Flask + /graphql
│       ├── main.py       # Orchestrateur ETL
│       ├── extract.py
│       ├── transform.py
│       ├── load.py
│       └── schema.py
├── Frontend/
│   ├── package.json
│   └── src/ (React + components)
└── Legacy/
        └── app.py (prototype Dash + notebooks)
```

**Conseils pour le développement local**

- S'assurer que le backend est lancé (voir `python src/app.py`) avant de démarrer le frontend.
- Configurer l'URL GraphQL dans `Frontend/.env` (variable `VITE_GRAPHQL_URL`). Exemple :

```env
VITE_GRAPHQL_URL=http://localhost:5001/graphql
```

- Pour régénérer les données propres après modification de la configuration ou des scripts d'extraction :

```powershell
cd Backend
python src/main.py
```

**Tests**

- Il existe un test smoke basique dans `tests/test_smoke.py` à la racine. Pour l'exécuter :

```powershell
python -m pytest -q
```

**Questions / modifications**

Si vous voulez que j'ajoute des sections détaillées (par ex. commandes Docker, description des endpoints GraphQL, exemples de requêtes) dites-le et je complète les README.

---

Fin du README racine.
```

