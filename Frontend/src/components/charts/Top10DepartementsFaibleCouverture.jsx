import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";

export default function Top10DepartementsFaibleCouverture({ timeRange = [2016, 2024] }) {
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

  // Calculer la moyenne de couverture par département et prendre les 10 plus faibles
  const top10Data = useMemo(() => {
    if (!data?.toutesCouvertures || data.toutesCouvertures.length === 0) {
      return null;
    }

    // Grouper par département (comme dans le Legacy : par nom, pas par code)
    // Utiliser le nom comme clé pour correspondre exactement au Legacy
    const deptGroups = new Map();
    
    data.toutesCouvertures.forEach((item) => {
      const code = item.code;
      const nom = item.nom || `Département ${code}`;
      const taux = item.grippeTotale;
      
      // Filtrer selon la plage d'années sélectionnée
      // Filtrer uniquement les valeurs valides et exclure les taux à 0%
      if (nom && taux != null && !isNaN(taux) && taux > 0 && item.annee >= timeRange[0] && item.annee <= timeRange[1]) {
        // Utiliser le nom comme clé (comme dans le Legacy qui groupe par 'Département')
        if (!deptGroups.has(nom)) {
          deptGroups.set(nom, {
            code,
            count: 0,
            total: 0,
            values: [],
          });
        }
        
        const group = deptGroups.get(nom);
        group.count += 1;
        group.total += taux;
        group.values.push(taux);
      }
    });

    // Calculer la moyenne par département (uniquement si on a des données valides)
    const deptData = [];
    
    deptGroups.forEach((value, nom) => {
      if (value.count > 0) {
        const moyenne = value.total / value.count;
        deptData.push({
          code: value.code,
          nom,
          moyenne,
          count: value.count,
        });
      }
    });

    // Trier par moyenne croissante (les plus faibles en premier)
    deptData.sort((a, b) => a.moyenne - b.moyenne);

    // Prendre les 10 premiers (les plus faibles)
    const top10 = deptData.slice(0, 10);

    return {
      noms: top10.map((d) => d.nom),
      codes: top10.map((d) => d.code),
      taux: top10.map((d) => d.moyenne),
    };
  }, [data, timeRange]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Chargement des données de couverture vaccinale...
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

  if (!top10Data || top10Data.noms.length === 0) {
    return (
      <div className="w-full flex justify-center p-4">
        <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  // Palette de couleurs : Reds_r (rouge inversé, comme dans Legacy)
  // Palette seaborn Reds_r approximative : du rouge foncé au rouge clair
  const redsPalette = [
    "#67000d", // Rouge très foncé
    "#a50f15", // Rouge foncé
    "#cb181d", // Rouge moyen-foncé
    "#ef3b2c", // Rouge moyen
    "#fb6a4a", // Rouge clair
    "#fc9272", // Rouge très clair
    "#fcbba1", // Rouge pâle
    "#fee0d2", // Rouge très pâle
    "#fff5f0", // Presque blanc
  ];
  
  const maxTaux = Math.max(...top10Data.taux);
  const minTaux = Math.min(...top10Data.taux);
  
  const getColor = (taux) => {
    if (maxTaux === minTaux) return redsPalette[0];
    const normalized = (taux - minTaux) / (maxTaux - minTaux);
    const index = Math.floor(normalized * (redsPalette.length - 1));
    return redsPalette[index];
  };

  const plotData = [
    {
      type: "bar",
      orientation: "h", // Horizontal
      x: top10Data.taux,
      y: top10Data.noms,
      marker: {
        color: top10Data.taux.map(getColor), // Palette Reds_r
        line: {
          color: "#000000",
          width: 0.8,
        },
      },
      text: top10Data.taux.map((taux) => `${taux.toFixed(2)}%`),
      textposition: "outside",
      hovertemplate: "Département: %{y}<br>Taux moyen: %{x:.2f}%<extra></extra>",
    },
  ];

  const layout = {
    title: {
      text: "Top 10 des départements avec la plus faible couverture vaccinale contre la grippe",
      font: { 
        size: 18,
        family: "Inter, system-ui, sans-serif",
        color: "#1f2937",
      },
      x: 0.5,
      xanchor: "center",
    },
    xaxis: {
      title: {
        text: "Taux moyen de couverture vaccinale (%)",
        font: { size: 14, color: "#4b5563" },
      },
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      zeroline: true,
      zerolinecolor: "#9ca3af",
      zerolinewidth: 2,
    },
    yaxis: {
      title: {
        text: "Département",
        font: { size: 14, color: "#4b5563" },
      },
      autorange: "reversed",
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
    },
    height: 550,
    margin: { t: 100, b: 60, l: 180, r: 100 },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
  };

  const moyenne = top10Data.taux.reduce((a, b) => a + b, 0) / top10Data.taux.length;
  const minimum = Math.min(...top10Data.taux);
  const maximum = Math.max(...top10Data.taux);

  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Top 10 Départements - Faible Couverture
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Les 10 départements avec la plus faible couverture vaccinale contre la grippe
            </p>
          </div>

          <div className="w-full">
            <Plot
              data={plotData}
              layout={layout}
              config={{ 
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                displaylogo: false,
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>


        </div>
      </div>
    </section>
  );
}

