import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, Map as MapIcon } from "lucide-react";

function ChoroplethFrance({ timeRange = [2016, 2024] }) {
  const [geojson, setGeojson] = useState(null);
  const { data, loading, error } = useGraphQL(`
    query {
      toutesCouvertures {
        code
        nom
        annee
        grippeTotale
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

  // Calculer la moyenne de couverture vaccinale par département
  const dataByDept = useMemo(() => {
    if (!data?.toutesCouvertures || data.toutesCouvertures.length === 0) {
      return {};
    }

    const deptGroups = new Map();

    data.toutesCouvertures.forEach((item) => {
      const code = item.code;
      const taux = item.grippeTotale;

      // Filtrer selon la plage d'années sélectionnée et les valeurs valides
      if (code && taux != null && !isNaN(taux) && taux > 0 && item.annee >= timeRange[0] && item.annee <= timeRange[1]) {
        if (!deptGroups.has(code)) {
          deptGroups.set(code, {
            count: 0,
            total: 0,
          });
        }

        const group = deptGroups.get(code);
        group.count += 1;
        group.total += taux;
      }
    });

    const result = {};
    deptGroups.forEach((value, code) => {
      if (value.count > 0) {
        result[code] = value.total / value.count;
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
            Impossible de charger les données de couverture vaccinale
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

  // Palette personnalisée : du blanc (faible) au bleu foncé (forte couverture)
  // Correspond à la transition de l'image : blanc (34) -> bleu foncé (48)
  const customColorscale = [
    [0, "rgb(255, 255, 255)"],      // Blanc pur pour les valeurs les plus faibles
    [0.15, "rgb(240, 248, 255)"],  // Bleu très très clair
    [0.3, "rgb(200, 220, 240)"],   // Bleu très clair
    [0.45, "rgb(150, 180, 220)"],  // Bleu clair
    [0.6, "rgb(100, 140, 200)"],   // Bleu moyen
    [0.75, "rgb(60, 100, 180)"],   // Bleu
    [0.9, "rgb(30, 60, 140)"],     // Bleu foncé
    [1, "rgb(0, 30, 100)"],         // Bleu très foncé pour les valeurs les plus élevées
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
            colorscale: customColorscale, // Palette personnalisée blanc -> bleu
            showscale: true,
            colorbar: {
              title: {
                text: "Taux de couverture<br>vaccinale (%)",
                font: { size: 12 },
              },
            },
            hovertemplate: "Département: %{location}<br>Couverture: %{z:.2f}%<extra></extra>",
          },
      ]}
      layout={{
          title: {
            text: "Couverture vaccinale contre la grippe par département",
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
export default function ChoroplethFranceWrapper({ timeRange = [2016, 2024] }) {
  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Carte de Couverture Vaccinale
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Visualisation géographique de la couverture vaccinale contre la grippe 
              par département en France
            </p>
          </div>
          <ChoroplethFrance timeRange={timeRange} />
        </div>
      </div>
    </section>
  );
}
