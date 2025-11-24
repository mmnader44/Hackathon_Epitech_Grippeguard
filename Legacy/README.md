
# **Visualisation des Données de Santé Publique : GrippeGuard**

## **Description du Projet**

Ce projet vise à analyser et visualiser les données relatives à la grippe en France, en mettant l'accent sur les taux d'hospitalisations, les passages aux urgences et la couverture vaccinale. L'objectif principal est de fournir un tableau de bord interactif permettant aux utilisateurs d'explorer et de comprendre les tendances épidémiques, ainsi que les disparités géographiques et démographiques des données de santé publique.

## **Technologies Utilisées**

* **Python** : Pour l'ETL et le traitement des données (avec **Pandas**, **NumPy**).
* **Dash** : Framework Python pour créer une interface web interactive.
* **Plotly** : Bibliothèque pour la création de visualisations interactives.
* **GeoPandas** : Pour le traitement et la visualisation des données géospatiales.
* **Jupyter Notebooks** : Pour la documentation et l'exploration des données.

## **Fonctionnalités du Projet**

1. **Cartes Choroplèthiques Interactives** : Visualisation des taux de passages aux urgences, d'hospitalisations et de couverture vaccinale, avec une segmentation géographique par départements.
2. **Analyse des Taux par Classe d'Âge** : Comparaison des taux d'hospitalisations et de passages aux urgences par groupe d'âge.
3. **Évolution des Données** : Suivi des tendances de couverture vaccinale et des taux de grippe sur plusieurs années.
4. **Interface Interactive** : Dashboard interactif avec des filtres dynamiques pour explorer les données selon différents critères (ex : département, classe d'âge, etc.).

## **Installation**

1. **Cloner le projet** :

```bash
git clone https://github.com/votre-utilisateur/votre-repository.git
cd votre-repository
```

2. **Installer les dépendances** :

```bash
pip install -r requirements.txt
```

3. **Lancer l'application Dash** :

```bash
python app.py
```

L'application sera disponible à l'adresse suivante : [http://localhost:8050](http://localhost:8050)

## **Prochaines étapes et V2**

Dans une future version (V2), nous prévoyons d'ajouter :

* **Flux de données en temps réel** pour une surveillance continue.
* **Amélioration de l'interface utilisateur** avec des filtres plus avancés.
* **Modélisation prédictive** pour anticiper l'évolution de la grippe et optimiser les campagnes de vaccination.
* **Architecture améliorée** avec un backend ETL en Python (Airflow) et une API REST/GraphQL pour une meilleure gestion des données.

## **Contribuer**

Nous encourageons les contributions sur ce projet. Si vous souhaitez ajouter une fonctionnalité, corriger un bug ou améliorer la documentation, veuillez suivre les étapes suivantes :

1. Forkez le repository.
2. Créez une branche de votre fonctionnalité : `git checkout -b feature/nom-de-fonctionnalité`.
3. Commitez vos changements : `git commit -am 'Ajout de nouvelle fonctionnalité'`.
4. Push sur la branche : `git push origin feature/nom-de-fonctionnalité`.
5. Ouvrez une pull request.

## **Sources de Données**

Les données utilisées dans ce projet proviennent de sources publiques :

* **Santé Publique France** : [Couverture vaccinale, passages aux urgences, hospitalisations](https://www.santepubliquefrance.fr).
* **IQVIA** : [Données de distribution de vaccins](https://www.data.gouv.fr/organizations/iqvia-france/datasets).
* **GeoJSON** : [Données géographiques des départements français](https://france-geojson.gregoiredavid.fr/repo/departements.geojson).

## **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.
