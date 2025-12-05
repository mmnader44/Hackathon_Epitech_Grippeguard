import pandas as pd
from .model import train_model


def predict_campaign(df_campaign, start_year: int) -> int:
    """
    Prédit la valeur pour la campagne correspondant à `start_year`.

    - `df_campaign` : DataFrame agrégé par campagne, colonnes ['campagne','valeur']
    - `start_year` : année calendaire (ex: 2025 pour 2025-2026)

    Logique strictement issue du notebook : calcule `campagne_num`, entraîne un
    LinearRegression, extrait `last_campaign_start` par split('-') sur le label
    de la dernière campagne, calcule `num_campaign` puis prédit.
    """
    model, _ = train_model(df_campaign)

    last_campaign_start = int(df_campaign['campagne'].iloc[-1].split('-')[0])

    if start_year <= last_campaign_start:
        raise ValueError(f"Année déjà présente ou trop ancienne ! Veuillez entrer une année > {last_campaign_start}.")

    num_campaign = len(df_campaign) + (start_year - (last_campaign_start + 1))

    next_campaign_num = pd.DataFrame({'campagne_num': [num_campaign]})
    pred = model.predict(next_campaign_num)
    return int(pred[0])


def predict_by_choice(df_campaign, df_campaign_a, choice: str, start_year: int) -> int:
    """Choisit entre 'doses' et 'actes' puis appelle `predict_campaign`."""
    if choice == 'doses':
        df = df_campaign
    else:
        df = df_campaign_a
    return predict_campaign(df, start_year)