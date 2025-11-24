import pandas as pd
import geopandas as gpd


def clean_urgences(df):
	"""Transformer les colonnes urgences
	- convertir la date
	- convertir les taux en pourcentage pour affichage(diviser par 100)
	"""
	df['1er jour de la semaine'] = pd.to_datetime(df['1er jour de la semaine'])

	df["Taux de passages aux urgences pour grippe (%)"] = df['Taux de passages aux urgences pour grippe'] / 100
	df["Taux d'hospitalisations après passages aux urgences pour grippe (%)"] = df["Taux d'hospitalisations après passages aux urgences pour grippe"] / 100
	df["Taux d'actes médicaux SOS médecins pour grippe (%)"] = df["Taux d'actes médicaux SOS médecins pour grippe"] / 100

	df = df.drop([
		'Taux de passages aux urgences pour grippe',
		"Taux d'hospitalisations après passages aux urgences pour grippe",
		"Taux d'actes médicaux SOS médecins pour grippe"
	], axis=1, errors='ignore')

	return df


def clean_couverture(df):
	"""Calculer 'Grippe totale' comme moyenne des deux colonnes présentes."""
	df['Grippe totale'] = df[['Grippe moins de 65 ans à risque', 'Grippe 65 ans et plus']].mean(axis=1)
	return df


def clean_pharmacies(df):
	df['Adresse_codepostal_str'] = df['Adresse_codepostal'].astype(str).str.zfill(5)
	df['departement_code'] = df['Adresse_codepostal_str'].str[:2]
	pharmacy_counts = df['departement_code'].value_counts().reset_index()
	pharmacy_counts.columns = ['code', 'pharmacy_count']
	return pharmacy_counts


def merge_urgences_geo(gdf_geo, df_urgences):
	merged = gdf_geo.merge(df_urgences, left_on='code', right_on='Département Code', how='right')
	return gpd.GeoDataFrame(merged, geometry='geometry')


def merge_couverture_geo(gdf_geo, df_couv):
	merged = gdf_geo.merge(df_couv, left_on='nom', right_on='Département', how='right')
	merged = gpd.GeoDataFrame(merged, geometry='geometry')
	merged = merged.drop(['nom', 'Département Code'], axis=1, errors='ignore')
	return merged


def merge_pharmacies_geo(gdf_geo, df_pharmacies_counts):
	merged = gdf_geo.merge(df_pharmacies_counts, left_on='code', right_on='code', how='left')
	merged['pharmacy_count'] = merged['pharmacy_count'].fillna(0).astype(int)
	return gpd.GeoDataFrame(merged, geometry='geometry')


def prepare_urgences_for_frontend(gdf):
	"""Préparer urgences pour frontend.

	Renvoi le df tel quel, modifs à faire ici si besoin pour GraphQL.
	"""
	return gdf


def prepare_couverture_for_frontend(gdf):
	"""Voir prepare_urgences_for_frontend.
	Renvoi le df tel quel, modifs à faire ici si besoin pour GraphQL
	"""
	return gdf


def prepare_pharmacies_for_frontend(gdf):
	"""Voir prepare_urgences_for_frontend.
	Renvoi le df tel quel, modifs à faire ici si besoin pour GraphQL.
	"""
	return gdf

