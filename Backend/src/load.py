import os


def save_parquet(df, path):
    """Sauvegarder le DataFrame en parquet.
    """
    dirpath = os.path.dirname(path)
    if dirpath:
        os.makedirs(dirpath, exist_ok=True)
    df.to_parquet(path, index=False)
    print('Saved parquet:', path)


def save_csv(df, path):
    dirpath = os.path.dirname(path)
    if dirpath:
        os.makedirs(dirpath, exist_ok=True)
    df.to_csv(path, index=False)
    print('Saved csv:', path)
