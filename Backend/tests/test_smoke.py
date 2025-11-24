from unittest.mock import patch
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
import sys
from pathlib import Path

# Ajouter le dossier parent au path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))

import main


def fake_extract_all(cfg):
    """Simule extract_all() avec des petits DataFrames."""
    
    # Mini DataFrames
    urg = pd.DataFrame({"dep": ["01"], "nb_passages": [100]})
    cov = pd.DataFrame({"dep": ["01"], "couverture": [75.0]})
    pharma = pd.DataFrame({"dep": ["01"], "nb_pharmacies": [12]})

    # Mini GeoDataFrame
    gdf_depts = gpd.GeoDataFrame({
        "dep": ["01"],
        "geometry": [Point(5.0, 46.0)]
    })

    # Données simples pour campagnes
    doses = pd.DataFrame({"doses": [1000]})
    couvertures = pd.DataFrame({"dep": ["01"], "couverture": [70]})
    campagnes = pd.DataFrame({"campagne": ["2023"], "etat": ["ok"]})

    return {
        "urgences": urg,
        "couverture": cov,
        "pharmacies": pharma,
        "departements": gdf_depts,
        "doses": doses,
        "couvertures_campagnes": couvertures,
        "campagnes": campagnes,
    }


def test_get_clean_dfs_smoke():
    # On remplace extract_all par notre version fake
    with patch("main.extract_all", side_effect=fake_extract_all):
        dfs = main.get_clean_dfs()

        # On teste juste que les clés existent
        assert "urgences" in dfs
        assert "couverture" in dfs
        assert "pharmacies" in dfs
        assert "doses" in dfs
        assert "couvertures_campagnes" in dfs
        assert "campagnes" in dfs

        # Et que ça ne renvoie pas None
        for key, df in dfs.items():
            assert df is not None

print("Smoke test passed!")