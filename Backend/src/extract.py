import pandas as pd
import geopandas as gpd

def read_csv_url(url):
	"""
	Charger un CSV directement depuis une URL
	"""
	df = pd.read_csv(url)
	return df


def read_csv_url_with_sep(url, sep=';'):
	df = pd.read_csv(url, sep=sep)
	return df


def read_geojson_url(url):
	gdf = gpd.read_file(url)
	return gdf


def read_multi_campaign(url_dict):
	"""Charger tous les fichiers CSV de doses/shots vaccins en une seule fois"""
	dfs = []
	for campagne, url in url_dict.items():
		print('Chargement campagne', campagne)
		df = pd.read_csv(url)
		df['campagne'] = campagne
		dfs.append(df)
	if len(dfs) == 0:
		return pd.DataFrame()
	return pd.concat(dfs, ignore_index=True)


def extract_all(config):
	"""Extraire toutes les sources définies dans la config et retourner un dict de DataFrames."""
	sources = config['sources']

	urgences = read_csv_url(sources['urgences']['url'])
	couverture = read_csv_url(sources['couverture_vaccinale']['url'])
	departements = read_geojson_url(sources['geo_departements']['url'])
	pharmacies = read_csv_url_with_sep(sources['pharmacies']['url'], sep=';')

	doses = read_multi_campaign(sources.get('doses_campaigns', {}))
	couvertures_campagnes = read_multi_campaign(sources.get('couverture_campaigns', {}))
	campagnes = read_multi_campaign(sources.get('campagne_campaigns', {}))

	return {
		'urgences': urgences,
		'couverture': couverture,
		'departements': departements,
		'pharmacies': pharmacies,
		'doses': doses,
		'couvertures_campagnes': couvertures_campagnes,
		'campagnes': campagnes,
	}

