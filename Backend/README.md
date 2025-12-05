# Backend — GrippeGuard

Ce dossier contient le pipeline ETL, l'API GraphQL et les scripts de machine learning utilisés par le projet.

**Contenu principal**

- `config.yaml` : fichier de configuration (URLs sources, chemins de sortie, etc.).
- `requirements.txt` : dépendances Python requises.
- `data/` : dossiers `raw/` et `clean/` pour les données brutes et nettoyées.
- `ml/` : scripts ML (`preprocess.py`, `model.py`, `predict.py`, `run_real_test.py`).
- `src/` : code du backend :
  - `app.py` : serveur Flask exposant `/graphql` (API GraphQL).
  - `main.py` : orchestration ETL (extract → transform → load).
  - `extract.py`, `transform.py`, `load.py` : étapes ETL.
  - `schema.py` : définition du schéma GraphQL utilisé par `app.py`.

## Installation (Windows / PowerShell)

1. Créez un environnement virtuel (recommandé) :

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

2. Vérifiez `config.yaml` : adaptez les URLs et les chemins de sortie si nécessaire.

## Commandes utiles

- Lancer le pipeline ETL (génère `data/clean/*.parquet` ou CSV) :

```powershell
cd Backend
python src/main.py
```

- Lancer l'API GraphQL (serveur Flask) :

```powershell
cd Backend
python src/app.py
```

  - Le port par défaut est `5001` (variable d'environnement `GRAPHQL_PORT`).
  - Endpoint principal : `http://localhost:5001/graphql`.

## Machine Learning

- Les scripts se trouvent dans `Backend/ml/` :
  - `preprocess.py` : transformations et préparation des features.
  - `model.py` : définition et entraînement du modèle.
  - `predict.py` : utilitaire pour charger un modèle et produire des prédictions.
  - `run_real_test.py` : script de test/évaluation.

Exécution d'un script de prédiction (exemple) :

```powershell
cd Backend
python ml/predict.py --model path/to/model.joblib --input data/raw/xxx.csv
```

## Configuration

- `config.yaml` contient les sources de données et les chemins `output.clean_dir` utilisés par `main.py`.
- Utilisez des variables d'environnement (ex : `GRAPHQL_PORT`, `FLASK_DEBUG`) pour contrôler l'API.

## Dépannage rapide

- Si extraction échoue, vérifiez les URLs dans `config.yaml`.
- Si le serveur GraphQL ne démarre pas, vérifiez qu'aucun autre service n'utilise le port `5001`.

---

Pour toute précision sur les endpoints GraphQL disponibles, dites-moi et j'ajouterai exemples de requêtes dans ce README.
