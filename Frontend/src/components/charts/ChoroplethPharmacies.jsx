import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, MapPin } from "lucide-react";

function ChoroplethPharmacies() {
  const [geojson, setGeojson] = useState(null);
  const { data, loading, error } = useGraphQL(`
    query {
      tousPharmacies {
        code
        nom
        nombrePharmacies
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

  // Créer un mapping code -> nombre de pharmacies
  const dataByDept = useMemo(() => {
    if (!data?.tousPharmacies || data.tousPharmacies.length === 0) {
      return {};
    }

    const result = {};
    data.tousPharmacies.forEach((item) => {
      const code = item.code;
      const nombre = item.nombrePharmacies || 0;
      
      if (code) {
        result[code] = nombre;
      }
    });

    return result;
  }, [data]);

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
            Impossible de charger les données de pharmacies
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

  // Palette personnalisée : du bleu clair au bleu foncé pour le nombre de pharmacies
  // Plus il y a de pharmacies, plus la couleur est foncée
  const customColorscale = [
    [0, "rgb(240, 248, 255)"],  // Bleu très clair pour peu de pharmacies
    [0.2, "rgb(200, 220, 240)"], // Bleu clair
    [0.4, "rgb(150, 180, 220)"], // Bleu moyen-clair
    [0.6, "rgb(100, 140, 200)"], // Bleu moyen
    [0.8, "rgb(60, 100, 180)"],  // Bleu foncé
    [1, "rgb(30, 60, 140)"],     // Bleu très foncé pour beaucoup de pharmacies
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
                text: "Nombre de<br>pharmacies",
                font: { size: 12 },
              },
              tickformat: "d",
            },
            hovertemplate: "Département: %{location}<br>Nombre de pharmacies: %{z}<extra></extra>",
          },
        ]}
        layout={{
          title: {
            text: "Nombre de pharmacies par département",
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
export default function ChoroplethPharmaciesWrapper() {
  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Carte des Pharmacies
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Visualisation géographique du nombre de pharmacies par département en France.
            </p>
          </div>
          <ChoroplethPharmacies />
        </div>
      </div>
    </section>
  );
}

