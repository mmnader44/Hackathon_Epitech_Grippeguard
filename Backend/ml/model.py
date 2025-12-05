import numpy as np
from sklearn.linear_model import LinearRegression


def train_model(df_campaign):
    """
    Entraîne un LinearRegression sur l'indice de campagne -> valeur.

    Retourne le tuple (model, y_pred) où y_pred est la prédiction sur X d'entraînement.
    """
    df = df_campaign.copy()
    df['campagne_num'] = np.arange(len(df))

    X = df[['campagne_num']]
    y = df['valeur']

    model = LinearRegression()
    model.fit(X, y)

    y_pred = model.predict(X)
    return model, y_pred