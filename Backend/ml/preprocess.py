from pathlib import Path
import pandas as pd
import sys

# Ensure project root is importable so we can import Backend.src.extract when running as script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def build_campaign_dfs(doses_actes_all):
    """
    Extrait deux DataFrames agrégés depuis le DataFrame combiné `doses_actes_all`.

    Paramètre:
    - doses_actes_all: DataFrame contenant les colonnes au moins ['variable','campagne','valeur']

    Retourne:
    - df_campaign: agrégation des DOSES(J07E1) par 'campagne'
    - df_campaign_a: agrégation des ACTE(VGP) par 'campagne'
    """
    df_doses = doses_actes_all[doses_actes_all['variable'] == 'DOSES(J07E1)'].copy()
    df_actes = doses_actes_all[doses_actes_all['variable'] == 'ACTE(VGP)'].copy()

    df_campaign = df_doses.groupby('campagne', as_index=False)['valeur'].sum().reset_index(drop=True)
    df_campaign_a = df_actes.groupby('campagne', as_index=False)['valeur'].sum().reset_index(drop=True)

    return df_campaign, df_campaign_a