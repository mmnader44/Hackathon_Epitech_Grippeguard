"""
Schéma GraphQL pour exposer les données du backend (V2 - Optimisé).
Adapté à la vraie structure des données.
"""

import graphene
from graphene import ObjectType, String, Float, List, Field, Int, Boolean
from main import get_clean_dfs
import pandas as pd
import base64
import json
from shapely.geometry import mapping
import sys
from pathlib import Path

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from ml.predict import predict_by_choice, predict_campaign

_data_cache = {}
_graphql_cache = {}

def get_cached_dfs():
    """Récupère les données du cache ou les charge si nécessaire"""
    global _data_cache
    if not _data_cache:
        print("Chargement des données en cache...")
        _data_cache = get_clean_dfs()
        print("Données chargées en cache!")
    return _data_cache

def get_graphql_cache(key):
    """Récupère un résultat GraphQL du cache"""
    return _graphql_cache.get(key)

def set_graphql_cache(key, value):
    """Stocke un résultat GraphQL en cache"""
    _graphql_cache[key] = value

def encode_cursor(index):
    """Encode un index en cursor base64"""
    return base64.b64encode(str(index).encode()).decode()

def decode_cursor(cursor):
    """Decode un cursor base64 en index"""
    if not cursor:
        return 0
    try:
        return int(base64.b64decode(cursor.encode()).decode())
    except:
        return 0

def paginate_results(items, first=100, after=None):
    """
    Pagine une liste d'éléments
    Retourne: (edges, pageInfo, total_count)
    """
    start_cursor = decode_cursor(after) + 1 if after else 0
    end_index = start_cursor + first
    
    page_items = items[start_cursor:end_index]
    has_next = end_index < len(items)
    
    edges = [
        {'node': item}
        for item in page_items
    ]
    
    page_info = {
        'has_next_page': has_next,
        'has_previous_page': start_cursor > 0,
        'start_cursor': encode_cursor(start_cursor) if edges else None,
        'end_cursor': encode_cursor(end_index - 1) if edges else None,
    }
    
    return edges, page_info, len(items)

class UrgenceType(ObjectType):
    """Données d'urgences hospitalières par département et semaine"""
    code = String()
    nom = String()
    date = String()
    semaine = String()
    classe_age = String()
    region = String()
    taux_grippe = Float()
    taux_hospitalisation = Float()
    taux_sos_medecins = Float()

    class Meta:
        description = "Données des urgences hospitalières"

class CouvertureType(ObjectType):
    """Données de couverture vaccinale par département et année"""
    code = String()
    nom = String()
    annee = Int()
    hpv_filles_1_dose = Float()
    hpv_filles_2_doses = Float()
    hpv_garcons_1_dose = Float()
    hpv_garcons_2_doses = Float()
    meningocoque_c_10_14 = Float()
    meningocoque_c_15_19 = Float()
    meningocoque_c_20_24 = Float()
    grippe_moins_65_risque = Float()
    grippe_65_plus = Float()
    grippe_65_74 = Float()
    grippe_75_plus = Float()
    covid_65_plus = Float()
    grippe_totale = Float()
    region = String()
    geometry = String()  # GeoJSON string pré-cacké

    class Meta:
        description = "Données de couverture vaccinale"

class PharmacieType(ObjectType):
    """Données des pharmacies par département"""
    code = String()
    nom = String()
    nombre_pharmacies = Int()
    geometry = String()  # GeoJSON string pré-cacké

    class Meta:
        description = "Données des pharmacies par département"

class DoseType(ObjectType):
    """Données des doses vaccinales administrées"""
    campagne = String()
    date = String()
    jour = Int()
    variable = String()
    groupe = String()
    valeur = Int()

    class Meta:
        description = "Données des doses vaccinales"

class CouvertureCampagneType(ObjectType):
    """Données de couverture par campagne et région"""
    region = String()
    code = Int()
    variable = String()
    groupe = String()
    valeur = Int()
    campagne = String()

    class Meta:
        description = "Données de couverture par campagne"

class CampagneType(ObjectType):
    """Données consolidées des campagnes de vaccination"""
    campagne = String()
    date = String()
    variable = String()
    valeur = Int()
    cible = Int()

    class Meta:
        description = "Données des campagnes de vaccination"

class PageInfo(ObjectType):
    """Informations de pagination"""
    has_next_page = Boolean()
    has_previous_page = Boolean()
    start_cursor = String()
    end_cursor = String()

class UrgenceEdge(ObjectType):
    """Edge pour paginer les urgences"""
    node = Field(UrgenceType)

class UrgenceConnection(ObjectType):
    """Connection pour paginer les urgences"""
    edges = List(UrgenceEdge)
    page_info = Field(PageInfo)
    total_count = Int()

class CouvertureEdge(ObjectType):
    """Edge pour paginer les couvertures"""
    node = Field(CouvertureType)

class CouvertureConnection(ObjectType):
    """Connection pour paginer les couvertures"""
    edges = List(CouvertureEdge)
    page_info = Field(PageInfo)
    total_count = Int()

class PharmacieEdge(ObjectType):
    """Edge pour paginer les pharmacies"""
    node = Field(PharmacieType)

class PharmacieConnection(ObjectType):
    """Connection pour paginer les pharmacies"""
    edges = List(PharmacieEdge)
    page_info = Field(PageInfo)
    total_count = Int()

class DoseEdge(ObjectType):
    """Edge pour paginer les doses"""
    node = Field(DoseType)

class DoseConnection(ObjectType):
    """Connection pour paginer les doses"""
    edges = List(DoseEdge)
    page_info = Field(PageInfo)
    total_count = Int()

class PredictionType(ObjectType):
    """Résultat de prédiction pour une campagne"""
    campagne = String(description="Label de la campagne (ex: 2025‑2026)")
    annee_debut = Int(description="Année de début de la campagne")
    valeur_predite = Int(description="Valeur prédite (doses ou actes)")
    type_prediction = String(description="Type de prédiction: 'doses' ou 'actes'")

    class Meta:
        description = "Prédiction pour une campagne de vaccination"

def convert_geometry(geom):
    """Convertit une géométrie Shapely en GeoJSON string"""
    if geom is None:
        return None
    try:
        geom_dict = mapping(geom)
        return json.dumps(geom_dict)
    except Exception as e:
        print(f"Erreur conversion géométrie: {e}")
        return None

def df_to_urgences(df):
    """Convertit DataFrame urgences en objets GraphQL (vectorisé)"""
    if df.empty:
        return []
    
    result = [
        UrgenceType(
            code=str(code),
            nom=str(nom),
            date=str(date),
            semaine=str(semaine),
            classe_age=str(classe_age),
            region=str(region),
            taux_grippe=float(taux_grippe) if pd.notna(taux_grippe) else 0,
            taux_hospitalisation=float(taux_hosp) if pd.notna(taux_hosp) else 0,
            taux_sos_medecins=float(taux_sos) if pd.notna(taux_sos) else 0,
        )
        for code, nom, date, semaine, classe_age, region, taux_grippe, taux_hosp, taux_sos in zip(
            df['code'].astype(str),
            df['nom'].astype(str),
            df['1er jour de la semaine'].astype(str),
            df['Semaine'].astype(str),
            df['Classe d\'âge'].astype(str),
            df['Région'].astype(str),
            df['Taux de passages aux urgences pour grippe (%)'].fillna(0),
            df['Taux d\'hospitalisations après passages aux urgences pour grippe (%)'].fillna(0),
            df['Taux d\'actes médicaux SOS médecins pour grippe (%)'].fillna(0),
        )
    ]
    return result

def df_to_couvertures(df):
    """Convertit DataFrame couverture en objets GraphQL (vectorisé)"""
    if df.empty:
        return []
    
    result = []
    for _, row in df.iterrows():
        geom_str = convert_geometry(row.get('geometry')) if 'geometry' in row else None
        
        result.append(CouvertureType(
            code=str(row.get('code', '')),
            nom=str(row.get('Département', '')),
            annee=int(row.get('Année', 0)) if pd.notna(row.get('Année')) else 0,
            hpv_filles_1_dose=float(row.get('HPV filles 1 dose à 15 ans', 0)) if pd.notna(row.get('HPV filles 1 dose à 15 ans')) else 0,
            hpv_filles_2_doses=float(row.get('HPV filles 2 doses à 16 ans', 0)) if pd.notna(row.get('HPV filles 2 doses à 16 ans')) else 0,
            hpv_garcons_1_dose=float(row.get('HPV garçons 1 dose à 15 ans', 0)) if pd.notna(row.get('HPV garçons 1 dose à 15 ans')) else 0,
            hpv_garcons_2_doses=float(row.get('HPV garçons 2 doses à 16 ans', 0)) if pd.notna(row.get('HPV garçons 2 doses à 16 ans')) else 0,
            meningocoque_c_10_14=float(row.get('Méningocoque C 10-14 ans', 0)) if pd.notna(row.get('Méningocoque C 10-14 ans')) else 0,
            meningocoque_c_15_19=float(row.get('Méningocoque C 15-19 ans', 0)) if pd.notna(row.get('Méningocoque C 15-19 ans')) else 0,
            meningocoque_c_20_24=float(row.get('Méningocoque C 20-24 ans', 0)) if pd.notna(row.get('Méningocoque C 20-24 ans')) else 0,
            grippe_moins_65_risque=float(row.get('Grippe moins de 65 ans à risque', 0)) if pd.notna(row.get('Grippe moins de 65 ans à risque')) else 0,
            grippe_65_plus=float(row.get('Grippe 65 ans et plus', 0)) if pd.notna(row.get('Grippe 65 ans et plus')) else 0,
            grippe_65_74=float(row.get('Grippe 65-74 ans', 0)) if pd.notna(row.get('Grippe 65-74 ans')) else 0,
            grippe_75_plus=float(row.get('Grippe 75 ans et plus', 0)) if pd.notna(row.get('Grippe 75 ans et plus')) else 0,
            covid_65_plus=float(row.get('Covid-19 65 ans et plus', 0)) if pd.notna(row.get('Covid-19 65 ans et plus')) else 0,
            grippe_totale=float(row.get('Grippe totale', 0)) if pd.notna(row.get('Grippe totale')) else 0,
            region=str(row.get('Région', '')),
            geometry=geom_str,
        ))
    
    return result

def df_to_doses(df):
    """Convertit DataFrame doses en objets GraphQL (vectorisé)"""
    if df.empty:
        return []
    
    result = [
        DoseType(
            campagne=str(campagne),
            date=str(date),
            jour=int(jour) if pd.notna(jour) else 0,
            variable=str(variable),
            groupe=str(groupe),
            valeur=int(valeur) if pd.notna(valeur) else 0,
        )
        for campagne, date, jour, variable, groupe, valeur in zip(
            df['campagne'].astype(str),
            df['date'].astype(str),
            df['jour'].fillna(0),
            df['variable'].astype(str),
            df['groupe'].astype(str),
            df['valeur'].fillna(0),
        )
    ]
    return result

def df_to_couvertures_campagnes(df):
    """Convertit DataFrame couvertures_campagnes en objets GraphQL (vectorisé)"""
    if df.empty:
        return []
    
    result = [
        CouvertureCampagneType(
            region=str(region),
            code=int(code) if pd.notna(code) else 0,
            variable=str(variable),
            groupe=str(groupe),
            valeur=int(valeur) if pd.notna(valeur) else 0,
            campagne=str(campagne),
        )
        for region, code, variable, groupe, valeur, campagne in zip(
            df['region'].astype(str),
            df['code'].fillna(0),
            df['variable'].astype(str),
            df['groupe'].astype(str),
            df['valeur'].fillna(0),
            df['campagne'].astype(str),
        )
    ]
    return result

def df_to_campagnes(df):
    """Convertit DataFrame campagnes en objets GraphQL (vectorisé)"""
    if df.empty:
        return []
    
    result = [
        CampagneType(
            campagne=str(campagne),
            date=str(date),
            variable=str(variable),
            valeur=int(valeur) if pd.notna(valeur) else 0,
            cible=int(cible) if pd.notna(cible) else 0,
        )
        for campagne, date, variable, valeur, cible in zip(
            df['campagne'].astype(str),
            df['date'].astype(str),
            df['variable'].astype(str),
            df['valeur'].fillna(0),
            df['cible'].fillna(0),
        )
    ]
    return result

def get_aggregated_campaign_data():
    """Agrège les données par campagne pour les prédictions"""
    dfs = get_cached_dfs()
    df_doses_source = dfs['doses'].copy()

    df_doses = df_doses_source[df_doses_source['variable'] == 'DOSES(J07E1)'].groupby('campagne')['valeur'].sum().reset_index()
    df_doses.columns = ['campagne', 'valeur']
    
    df_actes = df_doses_source[df_doses_source['variable'] == 'ACTE(VGP)'].groupby('campagne')['valeur'].sum().reset_index()
    df_actes.columns = ['campagne', 'valeur']
    
    return df_doses, df_actes

def preload_cache():
    """Pré-charge TOUS les caches au démarrage"""
    print("\nPré-chargement du cache complet...")
    try:
        dfs = get_cached_dfs()
        
        # Pré-convertir et cacher toutes les urgences
        print(" Conversion urgences...")
        urgences = df_to_urgences(dfs['urgences'])
        set_graphql_cache('tous_urgences', urgences)
        print(f"Urgences cached: {len(urgences)} items")
        
        # Pré-convertir et cacher toutes les couvertures
        print(" Conversion couvertures...")
        couvertures = df_to_couvertures(dfs['couverture'])
        set_graphql_cache('toutes_couvertures', couvertures)
        print(f"Couvertures cached: {len(couvertures)} items")
        
        # Pré-convertir et cacher toutes les pharmacies
        print(" Conversion pharmacies...")
        df = dfs['pharmacies']
        pharmacies = [
            PharmacieType(
                code=str(code),
                nom=str(nom),
                nombre_pharmacies=int(count),
                geometry=convert_geometry(geom),
            )
            for code, nom, count, geom in zip(
                df['code'].astype(str),
                df['nom'].astype(str),
                df['pharmacy_count'].fillna(0),
                df['geometry'] if 'geometry' in df.columns else [None] * len(df),
            )
        ]
        set_graphql_cache('tous_pharmacies', pharmacies)
        print(f"Pharmacies cached: {len(pharmacies)} items")
        
        # Pré-convertir et cacher toutes les doses
        print(" Conversion doses...")
        doses = df_to_doses(dfs['doses'])
        set_graphql_cache('tous_doses', doses)
        print(f"Doses cached: {len(doses)} items")
        
        # Pré-convertir et cacher couvertures_campagnes
        print(" Conversion couvertures_campagnes...")
        cc = df_to_couvertures_campagnes(dfs['couvertures_campagnes'])
        set_graphql_cache('toutes_couvertures_campagnes', cc)
        print(f"Couvertures campagnes cached: {len(cc)} items")
        
        # Pré-convertir et cacher campagnes
        print(" Conversion campagnes...")
        campagnes = df_to_campagnes(dfs['campagnes'])
        set_graphql_cache('toutes_campagnes', campagnes)
        print(f"Campagnes cached: {len(campagnes)} items")
        
        print(" Cache complètement pré-chargé!\n")
    except Exception as e:
        print(f"Erreur lors du pré-chargement: {e}\n")

class Query(ObjectType):
    """Queries disponibles pour interroger les données"""

    # URGENCES - Avec pagination
    tous_urgences_pagined = Field(
        UrgenceConnection,
        first=Int(default_value=100),
        after=String(),
        description="Toutes les urgences avec pagination"
    )
    tous_urgences = List(UrgenceType, description="Toutes les données d'urgences (non paginé)")
    
    urgences_par_departement = List(
        UrgenceType,
        code=String(required=True),
        description="Urgences pour un département"
    )
    urgences_par_date = List(
        UrgenceType,
        date=String(required=True),
        description="Urgences pour une date spécifique"
    )


    # COUVERTURES - Avec pagination
    toutes_couvertures_pagined = Field(
        CouvertureConnection,
        first=Int(default_value=100),
        after=String(),
        description="Toutes les couvertures avec pagination"
    )
    toutes_couvertures = List(CouvertureType, description="Toutes les données de couverture vaccinale (non paginé)")
    
    couvertures_par_departement = List(
        CouvertureType,
        code=String(required=True),
        description="Couvertures pour un département"
    )
    couvertures_par_annee = List(
        CouvertureType,
        annee=Int(required=True),
        description="Couvertures pour une année"
    )

    # PHARMACIES - Avec pagination
    tous_pharmacies_pagined = Field(
        PharmacieConnection,
        first=Int(default_value=100),
        after=String(),
        description="Toutes les pharmacies avec pagination"
    )
    tous_pharmacies = List(PharmacieType, description="Toutes les pharmacies par département (non paginé)")
    
    # DOSES - Avec pagination
    tous_doses_pagined = Field(
        DoseConnection,
        first=Int(default_value=100),
        after=String(),
        description="Toutes les doses avec pagination"
    )
    tous_doses = List(DoseType, description="Toutes les doses vaccinales (non paginé)")
    doses_par_campagne = List(
        DoseType,
        campagne=String(required=True),
        description="Doses pour une campagne"
    )

    toutes_couvertures_campagnes = List(CouvertureCampagneType, description="Couvertures par campagne")
    toutes_campagnes = List(CampagneType, description="Données consolidées des campagnes")

    # Prédictions
    predire_campagne = Field(
        PredictionType,
        annee_debut=Int(required=True, description="Année de début de la campagne à prédire (ex: 2025 pour 2025-2026)"),
        type_prediction=String(default_value="doses", description="Type de prédiction: 'doses' ou 'actes'"),
        description="Prédit la valeur pour une future campagne de vaccination"
    )

    # Stats
    stats_urgences = Float(description="Moyenne des taux de grippe")
    stats_couverture = Float(description="Moyenne de couverture grippe")

    def resolve_tous_urgences_pagined(self, info, first=100, after=None):
        """Retourne toutes les urgences avec pagination"""
        try:
            cached = get_graphql_cache('tous_urgences')
            if not cached:
                print("📦 Chargement des urgences...")
                dfs = get_cached_dfs()
                cached = df_to_urgences(dfs['urgences'])
                set_graphql_cache('tous_urgences', cached)
            
            edges, page_info, total = paginate_results(cached, first, after)
            
            return UrgenceConnection(
                edges=edges,
                page_info=page_info,
                total_count=total
            )
        except Exception as e:
            print(f"Erreur urgences pagined: {e}")
            return None

    def resolve_tous_urgences(self, info):
        """Retourne toutes les urgences"""
        try:
            cached = get_graphql_cache('tous_urgences')
            if cached:
                print("Urgences depuis cache!")
                return cached
            
            dfs = get_cached_dfs()
            result = df_to_urgences(dfs['urgences'])
            set_graphql_cache('tous_urgences', result)
            return result
        except Exception as e:
            print(f"Erreur urgences: {e}")
            return []

    def resolve_urgences_par_departement(self, info, code):
        """Filtre urgences par code département"""
        try:
            dfs = get_cached_dfs()
            df = dfs['urgences'][dfs['urgences']['code'] == code]
            return df_to_urgences(df)
        except Exception as e:
            print(f"Erreur urgences dept: {e}")
            return []

    def resolve_urgences_par_date(self, info, date):
        """Filtre urgences par date"""
        try:
            dfs = get_cached_dfs()
            df = dfs['urgences'][dfs['urgences']['1er jour de la semaine'].astype(str).str.contains(date)]
            return df_to_urgences(df)
        except Exception as e:
            print(f"Erreur urgences date: {e}")
            return []

    def resolve_toutes_couvertures_pagined(self, info, first=100, after=None):
        """Retourne toutes les couvertures avec pagination"""
        try:
            cached = get_graphql_cache('toutes_couvertures')
            if not cached:
                print("Chargement des couvertures...")
                dfs = get_cached_dfs()
                cached = df_to_couvertures(dfs['couverture'])
                set_graphql_cache('toutes_couvertures', cached)
            
            edges, page_info, total = paginate_results(cached, first, after)
            
            return CouvertureConnection(
                edges=edges,
                page_info=page_info,
                total_count=total
            )
        except Exception as e:
            print(f"Erreur couvertures pagined: {e}")
            return None

    def resolve_toutes_couvertures(self, info):
        """Retourne toutes les couvertures"""
        try:
            cached = get_graphql_cache('toutes_couvertures')
            if cached:
                print("Couvertures depuis cache!")
                return cached
            
            dfs = get_cached_dfs()
            result = df_to_couvertures(dfs['couverture'])
            set_graphql_cache('toutes_couvertures', result)
            return result
        except Exception as e:
            print(f"Erreur couvertures: {e}")
            return []

    def resolve_couvertures_par_departement(self, info, code):
        """Filtre couvertures par code département"""
        try:
            dfs = get_cached_dfs()
            df = dfs['couverture'][dfs['couverture']['code'] == code]
            return df_to_couvertures(df)
        except Exception as e:
            print(f"Erreur couvertures dept: {e}")
            return []

    def resolve_couvertures_par_annee(self, info, annee):
        """Filtre couvertures par année"""
        try:
            dfs = get_cached_dfs()
            df = dfs['couverture'][dfs['couverture']['Année'] == annee]
            return df_to_couvertures(df)
        except Exception as e:
            print(f"Erreur couvertures annee: {e}")
            return []

    def resolve_tous_pharmacies_pagined(self, info, first=100, after=None):
        """Retourne toutes les pharmacies avec pagination"""
        try:
            cached = get_graphql_cache('tous_pharmacies')
            if not cached:
                print("Chargement des pharmacies...")
                dfs = get_cached_dfs()
                df = dfs['pharmacies']
                
                cached = [
                    PharmacieType(
                        code=str(code),
                        nom=str(nom),
                        nombre_pharmacies=int(count),
                        geometry=convert_geometry(geom),
                    )
                    for code, nom, count, geom in zip(
                        df['code'].astype(str),
                        df['nom'].astype(str),
                        df['pharmacy_count'].fillna(0),
                        df['geometry'] if 'geometry' in df.columns else [None] * len(df),
                    )
                ]
                set_graphql_cache('tous_pharmacies', cached)
            
            edges, page_info, total = paginate_results(cached, first, after)
            
            return PharmacieConnection(
                edges=edges,
                page_info=page_info,
                total_count=total
            )
        except Exception as e:
            print(f"Erreur pharmacies pagined: {e}")
            return None

    def resolve_tous_pharmacies(self, info):
        """Retourne toutes les pharmacies"""
        try:
            cached = get_graphql_cache('tous_pharmacies')
            if cached:
                print("Pharmacies depuis cache!")
                return cached
            
            dfs = get_cached_dfs()
            df = dfs['pharmacies']
            
            # Vectorisé
            result = [
                PharmacieType(
                    code=str(code),
                    nom=str(nom),
                    nombre_pharmacies=int(count),
                    geometry=convert_geometry(geom),
                )
                for code, nom, count, geom in zip(
                    df['code'].astype(str),
                    df['nom'].astype(str),
                    df['pharmacy_count'].fillna(0),
                    df['geometry'] if 'geometry' in df.columns else [None] * len(df),
                )
            ]
            set_graphql_cache('tous_pharmacies', result)
            return result
        except Exception as e:
            print(f"Erreur pharmacies: {e}")
            return []

    def resolve_tous_doses_pagined(self, info, first=100, after=None):
        """Retourne toutes les doses avec pagination"""
        try:
            cached = get_graphql_cache('tous_doses')
            if not cached:
                print("Chargement des doses...")
                dfs = get_cached_dfs()
                cached = df_to_doses(dfs['doses'])
                set_graphql_cache('tous_doses', cached)
            
            edges, page_info, total = paginate_results(cached, first, after)
            
            return DoseConnection(
                edges=edges,
                page_info=page_info,
                total_count=total
            )
        except Exception as e:
            print(f"Erreur doses pagined: {e}")
            return None

    def resolve_tous_doses(self, info):
        """Retourne toutes les doses"""
        try:
            cached = get_graphql_cache('tous_doses')
            if cached:
                return cached
            
            dfs = get_cached_dfs()
            result = df_to_doses(dfs['doses'])
            set_graphql_cache('tous_doses', result)
            return result
        except Exception as e:
            print(f"Erreur doses: {e}")
            return []

    def resolve_doses_par_campagne(self, info, campagne):
        """Filtre doses par campagne"""
        try:
            dfs = get_cached_dfs()
            df = dfs['doses'][dfs['doses']['campagne'] == campagne]
            return df_to_doses(df)
        except Exception as e:
            print(f"Erreur doses campagne: {e}")
            return []

    def resolve_toutes_couvertures_campagnes(self, info):
        """Retourne toutes couvertures par campagne"""
        try:
            cached = get_graphql_cache('toutes_couvertures_campagnes')
            if cached:
                return cached
            
            dfs = get_cached_dfs()
            result = df_to_couvertures_campagnes(dfs['couvertures_campagnes'])
            set_graphql_cache('toutes_couvertures_campagnes', result)
            return result
        except Exception as e:
            print(f"Erreur couvertures campagnes: {e}")
            return []

    def resolve_toutes_campagnes(self, info):
        """Retourne toutes les campagnes"""
        try:
            cached = get_graphql_cache('toutes_campagnes')
            if cached:
                return cached
            
            dfs = get_cached_dfs()
            result = df_to_campagnes(dfs['campagnes'])
            set_graphql_cache('toutes_campagnes', result)
            return result
        except Exception as e:
            print(f"Erreur campagnes: {e}")
            return []

    def resolve_predire_campagne(self, info, annee_debut, type_prediction="doses"):
        """Prédit la valeur pour une future campagne"""
        try:
            if type_prediction not in ['doses', 'actes']:
                raise ValueError("type_prediction doit être 'doses' ou 'actes'")
            
            df_doses, df_actes = get_aggregated_campaign_data()
            
            valeur_predite = predict_by_choice(
                df_campaign=df_doses,
                df_campaign_a=df_actes,
                choice=type_prediction,
                start_year=annee_debut
            )
            
            annee_fin = annee_debut + 1
            campagne_label = f"{annee_debut}‑{annee_fin}"
            
            return PredictionType(
                campagne=campagne_label,
                annee_debut=annee_debut,
                valeur_predite=valeur_predite,
                type_prediction=type_prediction
            )
        except ValueError as ve:
            print(f"Erreur de validation prédiction: {ve}")
            raise Exception(str(ve))
        except Exception as e:
            print(f"Erreur prédiction: {e}")
            raise Exception(f"Impossible d'effectuer la prédiction: {str(e)}")

    def resolve_stats_urgences(self, info):
        """Statistique: moyenne des taux de grippe"""
        try:
            dfs = get_cached_dfs()
            return float(dfs['urgences']['Taux de passages aux urgences pour grippe (%)'].mean())
        except:
            return 0.0

    def resolve_stats_couverture(self, info):
        """Statistique: moyenne de couverture grippe"""
        try:
            dfs = get_cached_dfs()
            return float(dfs['couverture']['Grippe totale'].mean())
        except:
            return 0.0

schema = graphene.Schema(query=Query)
preload_cache()