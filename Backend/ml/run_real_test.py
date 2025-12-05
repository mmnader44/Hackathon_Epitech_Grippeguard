import yaml
import re
from pathlib import Path
from Backend.src.extract import read_multi_campaign
from Backend.ml.preprocess import build_campaign_dfs
from Backend.ml.predict import predict_by_choice

print('Reading Backend/config.yaml')
cfg = yaml.safe_load(open(Path('Backend/config.yaml'),'r',encoding='utf-8'))
urls = cfg.get('sources', {}).get('doses_campaigns', {})
print('URLs keys:', list(urls.keys()))

print('Downloading campaign CSVs (this may take a few seconds)...')
doses_actes_all = read_multi_campaign(urls)
print('Loaded rows:', len(doses_actes_all))

print('Building campaign dfs...')
dfc, dfa = build_campaign_dfs(doses_actes_all)
print('df_campaign head:\n', dfc.head())
print('df_campaign_a head:\n', dfa.head())

# Normaliser les labels de campagne pour correspondre au séparateur attendu dans predict.py
# (le code de prédiction utilise split('‑') U+2011). Remplacer '-' ASCII par '‑'.
dfc['campagne'] = dfc['campagne'].astype(str).str.replace('-', '‑')
dfa['campagne'] = dfa['campagne'].astype(str).str.replace('-', '‑')

# Simulate a user input year for prediction (change this value to test other years)
test_year = 2025
print('Using test_year =', test_year)

print('Prediction doses:', predict_by_choice(dfc, dfa, 'doses', test_year))
print('Prediction actes :', predict_by_choice(dfc, dfa, 'actes', test_year))
