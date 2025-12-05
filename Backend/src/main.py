"""
Ce module sert à :
1. Charger les données (extract)
2. Nettoyer et transformer les données (transform)
3. Renvoyer des DataFrames propres pour le backend GraphQL

Le backend GraphQL pourra appeler `get_clean_dfs()` pour récupérer toutes les données.
"""

from pathlib import Path
from load import save_parquet, save_csv
import yaml
import os

from extract import extract_all
from transform import (
    clean_urgences, clean_couverture, clean_pharmacies,
    merge_urgences_geo, merge_couverture_geo, merge_pharmacies_geo,
    prepare_urgences_for_frontend, prepare_couverture_for_frontend, prepare_pharmacies_for_frontend
)

# Chemin vers config.yaml (dans le répertoire parent de src/)
_CONFIG_PATH = Path(__file__).parent.parent / 'config.yaml'

def load_config(path=None):
    """
    Charge le fichier de configuration YAML.
    Il contient toutes les URLs des données.
    """
    if path is None:
        path = _CONFIG_PATH
    else:
        # Si un chemin relatif est fourni, le résoudre depuis le répertoire parent
        if not os.path.isabs(path):
            path = Path(__file__).parent.parent / path
    
    with open(path) as f:
        return yaml.safe_load(f)


def get_clean_dfs(config_path=None):
    """
    Charge toutes les données brutes, les nettoie et renvoie un dictionnaire
    avec tous les DataFrames prêts à être utilisés par le GraphQL.

    Le dictionnaire renvoyé contient :
        - urgences
        - couverture
        - pharmacies
        - doses
        - couvertures_campagnes
        - campagnes
    """

    # On charge la config (fichiers/URLs)
    cfg = load_config(config_path)

    # On charge toutes les données brutes
    data = extract_all(cfg)

    # On nettoie les DataFrames simples
    df_urg = clean_urgences(data['urgences'])
    df_couv = clean_couverture(data['couverture'])
    df_pharma_counts = clean_pharmacies(data['pharmacies'])

    # On récupère la GeoDataFrame des départements
    gdf_depts = data['departements']

    # On fusionne les données nettoyées avec la carte (GeoJSON)
    gdf_urg = merge_urgences_geo(gdf_depts, df_urg)
    gdf_couv = merge_couverture_geo(gdf_depts, df_couv)
    gdf_pharma = merge_pharmacies_geo(gdf_depts, df_pharma_counts)

    # Préparation finale (actuellement ne fait rien, mais utile si on veut filtrer plus tard)
    df_urg_front = prepare_urgences_for_frontend(gdf_urg)
    df_couv_front = prepare_couverture_for_frontend(gdf_couv)
    df_pharma_front = prepare_pharmacies_for_frontend(gdf_pharma)

    # On renvoie toutes les données dans un seul dict
    return {
        'urgences': df_urg_front,
        'couverture': df_couv_front,
        'pharmacies': df_pharma_front,
        'doses': data['doses'],                       # déjà chargé dans extract_all
        'couvertures_campagnes': data['couvertures_campagnes'],
        'campagnes': data['campagnes'],
    }


def get_urgences(config_path=None):
    """Retourne uniquement le DataFrame des urgences (avec geometrie pour la carte)."""
    return get_clean_dfs(config_path)['urgences']


def get_couverture(config_path=None):
    """Retourne uniquement la couverture vaccinale (avec geometry)."""
    return get_clean_dfs(config_path)['couverture']


def get_clean_df(name, config_path=None):
    """
    Permet de récupérer un seul DataFrame nettoyé,
    par exemple : get_clean_df('urgences')
    """
    dfs = get_clean_dfs(config_path)
    return dfs.get(name)


if __name__ == '__main__':
    """
    Début du script principal.
    """

    # On charge la config pour savoir où enregistrer les fichiers
    cfg = load_config()
    out_dir = Path(cfg['output']['clean_dir'])
    out_dir.mkdir(parents=True, exist_ok=True)

    # On récupère tous les DataFrames nettoyés avec transform.py
    dfs = get_clean_dfs()

    # On essaye d'enregistrer chaque DataFrame en parquet
    # Si ça marche pas, on enregistre en CSV
    for name, df in dfs.items():
        parquet_path = out_dir / f"{name}.parquet"
        csv_path = out_dir / f"{name}.csv"

        try:
            save_parquet(df, parquet_path)
        except:
            try:
                save_csv(df, csv_path)
            except Exception as e:
                print("Could not write", name, ":", e)

