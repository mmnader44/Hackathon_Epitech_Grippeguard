import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, MapPin } from "lucide-react";

function ChoroplethUrgences({ timeRange = [2016, 2024] }) {
  const [geojson, setGeojson] = useState(null);
  const { data, loading, error } = useGraphQL(`
    query {
      tousUrgences {
        code
        nom
        date
        tauxGrippe
      }
    }
  `);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson"
    )
      .then((res) => res.json())
      .then((js) => setGeojson(js))
      .catch((err) =>
        console.error("Erreur lors du chargement du GeoJSON :", err)
      );
  }, []);

  // Calculer la moyenne de taux de passages aux urgences par département
  // Comme dans le Legacy, on groupe par nom de département pour correspondre à leur logique
  const dataByDept = useMemo(() => {
    if (!data?.tousUrgences || data.tousUrgences.length === 0) {
      return {};
    }

    // Grouper par nom de département (comme dans le Legacy qui groupe par 'Département')
    // On crée un mapping nom -> {code, count, total} pour ensuite mapper vers le code
    const deptGroupsByName = new Map();
    const nomToCode = new Map(); // Mapping nom -> code (pour gérer les cas où un nom a plusieurs codes)

    data.tousUrgences.forEach((item) => {
      const code = item.code;
      const nom = item.nom;
      const taux = item.tauxGrippe;
      const dateStr = item.date;

      // Parser la date pour extraire l'année
      let year = null;
      if (dateStr) {
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            year = date.getFullYear();
          } else {
            // Essayer d'autres formats
            const dateMatch = dateStr.match(/(\d{4})/);
            if (dateMatch) {
              year = parseInt(dateMatch[1]);
            }
          }
        } catch (e) {
          // Ignorer les dates invalides
        }
      }

      // Filtrer selon la plage d'années sélectionnée et les valeurs valides
      // Note: on ne filtre pas taux > 0 car le Legacy n'applique pas ce filtre
      if (nom && code && taux != null && !isNaN(taux) && year >= timeRange[0] && year <= timeRange[1]) {
        // Stocker le mapping nom -> code (on prend le premier code rencontré pour chaque nom)
        if (!nomToCode.has(nom)) {
          nomToCode.set(nom, code);
        }

        if (!deptGroupsByName.has(nom)) {
          deptGroupsByName.set(nom, {
            count: 0,
            total: 0,
          });
        }

        const group = deptGroupsByName.get(nom);
        group.count += 1;
        group.total += taux;
      }
    });

    // Créer un mapping code -> moyenne (en utilisant le nom comme clé intermédiaire)
    const result = {};
    deptGroupsByName.forEach((value, nom) => {
      if (value.count > 0) {
        const code = nomToCode.get(nom);
        if (code) {
          result[code] = value.total / value.count;
        }
      }
    });

    return result;
  }, [data, timeRange]);

  if (loading || !geojson) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Chargement de la carte...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center p-4">
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Erreur de chargement</p>
          </div>
          <p className="text-xs text-red-500 mt-2">
            Impossible de charger les données d'urgences
          </p>
        </div>
      </div>
    );
  }

  const locations = [];
  const z = [];

  for (const feat of geojson.features) {
    const code = feat.properties.code;
    const val = dataByDept[code] ?? 0;

    locations.push(code);
    z.push(val);
  }

  // Palette personnalisée : du beige/off-white clair (4%) au rouge foncé/marron (12%)
  // Correspond à la transition de l'image : beige clair (4%) -> rouge foncé (12%)
  const customColorscale = [
    [0, "rgb(255, 255, 240)"],      // Beige/off-white très clair pour les valeurs les plus faibles (4%)
    [0.1, "rgb(254, 240, 217)"],   // Beige très clair
    [0.2, "rgb(253, 204, 138)"],   // Beige/orange clair
    [0.3, "rgb(252, 141, 89)"],    // Orange clair
    [0.4, "rgb(239, 101, 72)"],    // Orange
    [0.5, "rgb(215, 48, 31)"],      // Orange-rouge
    [0.6, "rgb(179, 0, 0)"],       // Rouge
    [0.7, "rgb(153, 0, 0)"],       // Rouge foncé
    [0.8, "rgb(128, 0, 0)"],       // Rouge très foncé
    [0.9, "rgb(102, 0, 0)"],       // Rouge très très foncé
    [1, "rgb(80, 0, 0)"],          // Rouge/marron le plus foncé pour les valeurs les plus élevées (12%)
  ];

  return (
    <div className="w-full flex flex-col items-center p-4">
      <Plot
        data={[
          {
            type: "choropleth",
            geojson,
            locations,
            z,
            featureidkey: "properties.code",
            colorscale: customColorscale,
            showscale: true,
            colorbar: {
              title: {
                text: "Taux de passages<br>aux urgences (%)",
                font: { size: 12 },
              },
              tickmode: "linear",
              tick0: 4,
              dtick: 2,
              tickformat: ".0f",
              ticks: "outside",
            },
            hovertemplate: "Département: %{location}<br>Taux d'urgences: %{z:.2f}%<extra></extra>",
          },
        ]}
        layout={{
          title: {
            text: "Taux moyen de passages aux urgences pour grippe (%) par département",
            font: { 
              size: 18,
              family: "Inter, system-ui, sans-serif",
              color: "#1f2937",
            },
            x: 0.5,
            xanchor: "center",
          },
          geo: {
            scope: "europe",
            center: { lon: 2.5, lat: 46.5 },
            projection: { type: "mercator" },
            fitbounds: "locations",
            showframe: false,
            showcoastlines: false,
            showland: false,
            showocean: false,
            showcountries: false,
            showlakes: false,
            showrivers: false,
            bgcolor: "rgba(0,0,0,0)",
            lonaxis: { range: [-5, 10] },
            lataxis: { range: [41, 51] },
          },
          margin: { t: 100, b: 0, l: 0, r: 0 },
          height: 550,
          plot_bgcolor: "white",
          paper_bgcolor: "white",
        }}
        config={{ 
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
          displaylogo: false,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

// Wrapper avec card container
export default function ChoroplethUrgencesWrapper({ timeRange = [2016, 2024] }) {
  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Carte des Passages aux Urgences
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Visualisation géographique du taux moyen de passages aux urgences pour grippe par département en France.
            </p>
          </div>
          <ChoroplethUrgences timeRange={timeRange} />
        </div>
      </div>
    </section>
  );
}

