import dash
from dash import dcc, html
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import geopandas as gpd
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from io import BytesIO
import base64
import ssl
import urllib.request

# Désactive la vérification des certificats SSL (non recommandé en production)
ssl._create_default_https_context = ssl._create_unverified_context

 
# === Fonctions utilitaires ===
def create_image_from_matplotlib(fig):
    buffer = BytesIO()
    FigureCanvas(fig).print_png(buffer)
    return base64.b64encode(buffer.getvalue()).decode()
 
def create_choropleth_map(agg_gdf, column, title, cmap='OrRd'):
    fig, ax = plt.subplots(1, 1, figsize=(10, 8))
    agg_gdf.plot(column=column, cmap=cmap, linewidth=0.8, edgecolor='black', legend=True, ax=ax)
    ax.set_title(title)
    ax.set_axis_off()
    return create_image_from_matplotlib(fig)
 
# Initialize Dash app
app = dash.Dash(__name__)
 
# Passages aux urgences et Actes SOS Médecins (Département)
data = pd.read_csv('https://odisse.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/grippe-passages-aux-urgences-et-actes-sos-medecins-departement/exports/csv?lang=fr&timezone=Europe%2FBerlin&use_labels=true&delimiter=%2C')
 
# Couvertures vaccinales des adolescents et adultes depuis 2011 (Département)
data_couv = pd.read_csv('https://odisse.santepubliquefrance.fr/api/explore/v2.1/catalog/datasets/couvertures-vaccinales-des-adolescent-et-adultes-departement/exports/csv?lang=fr&timezone=Europe%2FBerlin&use_labels=true&delimiter=%2C')
 
# GeoJSON pour les départements
url = "https://france-geojson.gregoiredavid.fr/repo/departements.geojson"
departements = gpd.read_file(url)
 
merged = departements.merge(data, left_on='code', right_on='Département Code', how='right')
 
merged['Taux de passages aux urgences pour grippe (%)'] = merged['Taux de passages aux urgences pour grippe']/100
merged["Taux d'hospitalisations après passages aux urgences pour grippe (%)"] = merged["Taux d'hospitalisations après passages aux urgences pour grippe"]/100
merged["Taux d'actes médicaux SOS médecins pour grippe (%)"] = merged["Taux d'actes médicaux SOS médecins pour grippe"]/100
 
merge_drop = merged.drop(['Taux de passages aux urgences pour grippe', 'Taux d\'hospitalisations après passages aux urgences pour grippe', 'Taux d\'actes médicaux SOS médecins pour grippe'], axis=1)
 
merge_drop['1er jour de la semaine'] = pd.to_datetime(merge_drop['1er jour de la semaine'])
 
# === Cartes principales ===
gdf = gpd.GeoDataFrame(merge_drop, geometry='geometry')
 
# 1. Urgences
agg = gdf.groupby(['Département', 'geometry'])['Taux de passages aux urgences pour grippe (%)'].mean().reset_index()
image_urgence = create_choropleth_map(gpd.GeoDataFrame(agg, geometry='geometry'),
                                      'Taux de passages aux urgences pour grippe (%)',
                                      "Taux moyen de passages aux urgences pour grippe (%) par département")
 
# 2. Hospitalisations
agg = gdf.groupby(['Département', 'geometry'])["Taux d'hospitalisations après passages aux urgences pour grippe (%)"].mean().reset_index()
image_hospitalisations = create_choropleth_map(gpd.GeoDataFrame(agg, geometry='geometry'),
                                               "Taux d'hospitalisations après passages aux urgences pour grippe (%)",
                                               "Taux d'hospitalisations après passages aux urgences pour grippe (%)")
 
# 3. Couverture vaccinale
merged_couv = departements.merge(data_couv, left_on='nom', right_on='Département', how='right')
merged_couv.drop(['nom', 'Département Code'], axis=1, inplace=True)
merged_couv['Grippe totale'] = merged_couv[['Grippe moins de 65 ans à risque', 'Grippe 65 ans et plus']].mean(axis=1)
agg_couv = merged_couv.groupby(['Département', 'geometry'])['Grippe totale'].mean().reset_index()
image_vaccination = create_choropleth_map(gpd.GeoDataFrame(agg_couv, geometry='geometry'),
                                          'Grippe totale',
                                          "Taux moyen de couverture vaccinale contre la grippe par département",
                                          cmap='Blues')
 
# 4. Pharmacies
lieux_vaccination_df = pd.read_csv("https://www.data.gouv.fr/api/1/datasets/r/479afe3e-a2aa-4519-b509-ba9c106a5576", sep=";")
lieux_vaccination_df['Adresse_codepostal_str'] = lieux_vaccination_df['Adresse_codepostal'].astype(str).str.zfill(5)
lieux_vaccination_df['departement_code'] = lieux_vaccination_df['Adresse_codepostal_str'].str[:2]
pharmacy_counts = lieux_vaccination_df['departement_code'].value_counts().reset_index()
pharmacy_counts.columns = ['code', 'pharmacy_count']
merged_gdf = departements.merge(pharmacy_counts, left_on='code', right_on='code', how='left')
merged_gdf['pharmacy_count'] = merged_gdf['pharmacy_count'].fillna(0).astype(int)
image_pharmacies = create_choropleth_map(merged_gdf, 'pharmacy_count', "Nombre de pharmacies par département", cmap='Blues')
 
# === Graphiques originaux ===
# Flop 10 départements
department_avg_grippe = merged_couv.groupby('Département')['Grippe totale'].mean().reset_index()
flop_10_departements = department_avg_grippe.sort_values(by='Grippe totale', ascending=True).head(10)
fig_flop = plt.figure(figsize=(10,6))
sns.barplot(data=flop_10_departements, x='Grippe totale', y='Département', palette='Reds_r')
plt.title("10 départements avec la plus faible couverture vaccinale contre la grippe")
plt.xlabel("Taux moyen de couverture vaccinale (%)")
plt.ylabel("Département")
plt.tight_layout()
image_flop = create_image_from_matplotlib(fig_flop)
 
# Comparaison taux par âge
age_group_analysis = merge_drop.groupby('Classe d\'âge')['Taux de passages aux urgences pour grippe (%)'].mean().reset_index()
age_group_analysis_2 = merge_drop.groupby('Classe d\'âge')["Taux d'hospitalisations après passages aux urgences pour grippe (%)"].mean().reset_index()
merged_age = age_group_analysis.merge(age_group_analysis_2, on="Classe d'âge")
melted = merged_age.melt(id_vars="Classe d'âge", value_vars=["Taux de passages aux urgences pour grippe (%)",
                                                             "Taux d'hospitalisations après passages aux urgences pour grippe (%)"],
                         var_name="Type de taux", value_name="Taux (%)")
fig_comparaison = plt.figure(figsize=(10,6))
sns.barplot(data=melted, x="Classe d'âge", y="Taux (%)", hue="Type de taux")
plt.title("Comparaison des taux de passages et d'hospitalisations pour grippe par classe d'âge")
plt.xticks(rotation=45)
plt.tight_layout()
image_comparaison = create_image_from_matplotlib(fig_comparaison)
 
# Evolution séries
def _plot_series(series, series_name, series_index=0):
    palette = list(sns.palettes.mpl_palette('Dark2'))
    plt.plot(series['1er jour de la semaine'], series['Taux de passages aux urgences pour grippe (%)'],
             label=series_name, color=palette[series_index % len(palette)])
fig_series = plt.figure(figsize=(10,5.2))
df_sorted = merge_drop.sort_values('1er jour de la semaine', ascending=True)
for i, (series_name, series) in enumerate(df_sorted.groupby("Classe d'âge")):
    _plot_series(series, series_name, i)
fig_series.legend(title="Classe d'âge", loc='upper left', bbox_to_anchor=(0.2,1.0))
sns.despine(fig=fig_series)
plt.xlabel('Date')
plt.ylabel('Taux de passages aux urgences pour grippe (%)')
image_series = create_image_from_matplotlib(fig_series)
 
# Evolution couverture vaccinale
yearly_agg_couv = merged_couv.groupby('Année')['Grippe totale'].mean().reset_index()
fig_vaccination_evolution = plt.figure(figsize=(12,6))
sns.lineplot(data=yearly_agg_couv, x='Année', y='Grippe totale')
plt.title("Évolution annuelle de la couverture vaccinale contre la grippe")
plt.xlabel("Année")
plt.ylabel("Taux moyen de couverture vaccinale (%)")
plt.grid(True)
image_vaccination_evolution = create_image_from_matplotlib(fig_vaccination_evolution)
 
# === Données multi-campagnes (2021-2025) ===
url_doses = {
    "2021‑2022": "https://www.data.gouv.fr/api/1/datasets/r/d1a7a9c8-da2a-4840-be4e-720b4703462c",
    "2022‑2023": "https://www.data.gouv.fr/api/1/datasets/r/1339c744-6b09-4a21-a5a0-6f56200f7208",
    "2023‑2024": "https://www.data.gouv.fr/api/1/datasets/r/dccbba26-bf9a-4d30-8249-5a539354e69b",
    "2024‑2025": "https://www.data.gouv.fr/api/1/datasets/r/a6f6c78f-96eb-41e5-8c8e-54c2bcbbe3f2"
}
url_couverture = {
    "2021‑2022": "https://www.data.gouv.fr/api/1/datasets/r/70f1cfba-569c-46fd-aa0d-2bc890a42eb5",
    "2022‑2023": "https://www.data.gouv.fr/api/1/datasets/r/c36e85ef-077e-465e-b3e4-e218d972f45e",
    "2023‑2024": "https://www.data.gouv.fr/api/1/datasets/r/1b5339fe-47b9-4d29-9be6-792ac20e392b",
    "2024‑2025": "https://www.data.gouv.fr/api/1/datasets/r/848e3e48-4971-4dc5-97c7-d856cdfde2f6"
}
url_campagne = {
    "2021‑2022": "https://www.data.gouv.fr/api/1/datasets/r/b4867c67-70c9-459f-a88d-859996e8098b",
    "2022‑2023": "https://www.data.gouv.fr/api/1/datasets/r/992e690a-0c9c-4457-a556-3d70b4af29e8",
    "2023‑2024": "https://www.data.gouv.fr/api/1/datasets/r/40314f2c-12ea-4f4c-a3a2-855bab16e6dd",
    "2024‑2025": "https://www.data.gouv.fr/api/1/datasets/r/c26a4606-b6a5-49a9-ad18-89cc0e1fc8c2"
}
def charger_depuis_url(url_dict):
    dfs = []
    for campagne, url in url_dict.items():
        try:
            df = pd.read_csv(url)
            df["campagne"] = campagne
            dfs.append(df)
        except:
            continue
    return pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()
 
doses_actes_all = charger_depuis_url(url_doses)
couverture_all = charger_depuis_url(url_couverture)
campagne_all = charger_depuis_url(url_campagne)
 
couverture_all['code'] = couverture_all['code'].astype(str)
merged_multi = departements.merge(couverture_all, left_on='code', right_on='code', how='right')
 
# Boxplot campagne/groupe
fig_box = plt.figure(figsize=(10,6))
sns.boxplot(x='campagne', y='valeur', hue='groupe', data=merged_multi)
plt.title("Distribution des valeurs par campagne et groupe d'âge")
plt.xticks(rotation=45)
plt.legend(bbox_to_anchor=(1.05,1), loc='upper left')
plt.tight_layout()
image_box = create_image_from_matplotlib(fig_box)
 
# Barres empilées groupe/variable
group_variable_values = merged_multi.groupby(['groupe','variable'])['valeur'].sum().unstack()
fig_stack = plt.figure(figsize=(10,6))
group_variable_values.plot(kind='bar', stacked=True, color=['lightblue','orange'], ax=fig_stack.add_subplot(111))
plt.title("Répartition des valeurs par groupe et variable")
plt.xlabel("Groupe")
plt.ylabel("Valeur Totale")
plt.tight_layout()
image_stack = create_image_from_matplotlib(fig_stack)
 
# Barres par région
region_values = merged_multi.groupby('region')['valeur'].sum().sort_values()
fig_region = plt.figure(figsize=(10,6))
region_values.plot(kind='barh', color='skyblue', ax=fig_region.add_subplot(111))
plt.title("Valeurs totales par région")
plt.xlabel("Valeur Totale")
plt.ylabel("Région")
plt.tight_layout()
image_region = create_image_from_matplotlib(fig_region)
 
# Evolution campagne/variable
campaign_trends = merged_multi.groupby(['campagne','variable'])['valeur'].sum().unstack()
fig_campagne = plt.figure(figsize=(10,6))
campaign_trends.plot(kind='line', marker='o', ax=fig_campagne.add_subplot(111))
plt.title("Evolution des valeurs par campagne et variable")
plt.xlabel("Campagne")
plt.ylabel("Valeur Totale")
plt.legend(title='Variable')
plt.tight_layout()
image_campagne = create_image_from_matplotlib(fig_campagne)
 
# === Layout Dash ===
 
app.layout = html.Div([
 
    # --- Navbar ---
 
    html.Nav([
 
        html.Img(src='/assets/OPS_logo_elysee_300x300.png',
 
                 style={'height': '90px', 'marginRight': '1rem', 'filter': 'brightness(0) invert(1)'}),
 
        html.Ul([
 
            html.Li(html.A("Accueil", href="#accueil")),
 
            html.Li(html.A("Cartes", href="#cartes")),
 
            html.Li(html.A("Comparaisons", href="#comparaisons")),
 
            html.Li(html.A("Évolutions", href="#evolutions")),
 
            html.Li(html.A("Vaccination", href="#vaccination")),
 
            html.Li(html.A("Top 10", href="#top10")),
 
            html.Li(html.A("Distribution", href="#distribution")),
 
            html.Li(html.A("Répartition", href="#repartition")),
 
            html.Li(html.A("Régions", href="#regions")),
 
            html.Li(html.A("Campagnes", href="#campagnes"))
 
        ], style={
 
            'listStyle': 'none', 'display': 'flex', 'gap': '1rem',
 
            'alignItems': 'center', 'margin': 0, 'padding': 0
 
        })
 
    ], style={
 
        'position': 'fixed',
 
        'top': '0',
 
        'width': '100%',
 
        'backgroundColor': '#1e3a8a',
 
        'padding': '0.5rem 1rem',
 
        'zIndex': '1000',
 
        'boxShadow': '0 2px 6px rgba(0,0,0,0.15)',
 
        'display': 'flex',
 
        'alignItems': 'center'
 
    }),
 
    # --- Contenu principal ---
 
    html.Div([
 
        # Accueil
 
        html.Section([
 
            html.H1("Visualisation des données de santé publique",
 
                    style={'textAlign': 'center', 'color': '#1e3a8a'}),
 
            html.P("Analyse des taux de grippe, hospitalisations et couverture vaccinale en France.",
 
                   style={'textAlign': 'center', 'fontSize': '18px', 'color': '#4b5563'})
 
        ], id='accueil', style={'padding': '7.5rem 0 5rem'}),
 
        # Cartes
 
        html.Section([
 
            html.H2("Cartes interactives", style={'textAlign': 'center', 'color': '#1e3a8a'}),
 
            html.P("Sélectionnez une carte à afficher :", style={'textAlign': 'center'}),
 
            dcc.Dropdown(
 
                id='carte-dropdown',
 
                options=[
 
                    {'label': 'Taux de passages aux urgences pour grippe', 'value': 'urgence'},
 
                    {'label': 'Taux d\'hospitalisations après passages aux urgences', 'value': 'hospitalisations'},
 
                    {'label': 'Taux moyen de couverture vaccinale', 'value': 'vaccination'},
 
                    {'label': 'Nombre de pharmacies par département', 'value': 'pharmacies'}
 
                ],
 
                value='urgence',
 
                style={'width': '50%', 'margin': '0 auto 30px'}
 
            ),
 
            html.Div(id='carte-container', children=[
 
                html.Img(id='carte-image',
 
                         src=f"data:image/png;base64,{image_urgence}",
 
                         style={'width': '50%', 'display': 'block', 'margin': '0 auto'})
 
            ])
 
        ], id='cartes', style={
 
            'paddingTop': '80px', 'paddingBottom': '60px', 'backgroundColor': '#f9fafb'
 
        }),
 
        # === Sections graphiques ===
 
        html.Section([
 
            html.H3("Comparaison des taux par classe d'âge",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_comparaison}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='comparaisons', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px',
 
            'backgroundColor': '#f9fafb'
 
        }),
 
        html.Section([
 
            html.H3("Évolution des taux par classe d'âge",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_series}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='evolutions', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px'
 
        }),
 
        html.Section([
 
            html.H3("Évolution de la couverture vaccinale",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_vaccination_evolution}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='vaccination', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px',
 
            'backgroundColor': '#f9fafb'
 
        }),
 
        html.Section([
 
            html.H3("10 départements avec la plus faible couverture vaccinale",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_flop}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='top10', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px'
 
        }),
 
        html.Section([
 
            html.H3("Distribution des valeurs par campagne et groupe d'âge",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_box}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='distribution', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px',
 
            'backgroundColor': '#f9fafb'
 
        }),
 
        html.Section([
 
            html.H3("Répartition des valeurs par groupe et variable",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_stack}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='repartition', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px'
 
        }),
 
        html.Section([
 
            html.H3("Valeurs totales par région",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_region}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='regions', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px',
 
            'backgroundColor': '#f9fafb'
 
        }),
 
        html.Section([
 
            html.H3("Évolution des valeurs par campagne et variable",
 
                    style={'color': '#1e3a8a', 'textAlign': 'center', 'marginBottom': '20px'}),
 
            html.Img(src=f"data:image/png;base64,{image_campagne}",
 
                     style={'width': '80%', 'display': 'block', 'margin': '0 auto'})
 
        ], id='campagnes', style={
 
            'textAlign': 'center', 'paddingTop': '80px', 'paddingBottom': '60px'
 
        })
 
    ]),
 
    # --- Footer ---
 
    html.Footer([
 
        html.Img(src='/assets/OPS_logo_elysee_300x300.png',
 
                 style={'height': '90px', 'filter': 'brightness(0) invert(1)'}),
 
        html.P("© 2025 - Mehdi, Samy, Robin, Salah, Jaures", style={'color': '#ffffff'})
 
    ], style={
 
        'textAlign': 'center',
 
        'padding': '3rem 5rem',
 
        'display': 'flex',
 
        'flexDirection': 'row',
 
        'justifyContent': 'space-between',
 
        'alignItems': 'center',
 
        'backgroundColor': '#ce1126'
 
    })
 
], style={'marginTop': '60px'})
 
 
# --- Smooth scroll ---
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>Tableau de bord - Santé publique</title>
        {%favicon%}
        {%css%}
        <style>
            html { scroll-behavior: smooth; font-family: 'Roboto', sans-serif; }
            nav ul { list-style: none; display: flex; justify-content: center; margin: 0; padding: 0; }
            nav li { margin: 0 20px; }
            nav a { color: white; text-decoration: none; font-weight: 500; }
            nav a:hover { text-decoration: underline; }
        </style>
    </head>
    <body style="margin:0; padding:0;">
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''
 
 
@app.callback(
    dash.dependencies.Output('carte-image', 'src'),
    [dash.dependencies.Input('carte-dropdown', 'value')]
)
def update_map(selected_map):
    return {
        'urgence': f"data:image/png;base64,{image_urgence}",
        'hospitalisations': f"data:image/png;base64,{image_hospitalisations}",
        'vaccination': f"data:image/png;base64,{image_vaccination}",
        'pharmacies': f"data:image/png;base64,{image_pharmacies}"
    }[selected_map]
    
 
if __name__ == '__main__':
    app.run(debug=True)