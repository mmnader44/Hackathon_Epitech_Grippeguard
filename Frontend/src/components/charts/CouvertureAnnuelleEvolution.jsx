import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";

export default function CouvertureAnnuelleEvolution({ timeRange = [2016, 2024] }) {
  const { data, loading, error } = useGraphQL(`
    query {
      toutesCouvertures {
        annee
        grippeTotale
      }
    }
  `);

  // Grouper les données par année et calculer la moyenne
  const evolutionData = useMemo(() => {
    if (!data?.toutesCouvertures || data.toutesCouvertures.length === 0) {
      return null;
    }

    // Grouper par année
    const yearGroups = new Map();
    
    data.toutesCouvertures.forEach((item) => {
      const annee = item.annee;
      const taux = item.grippeTotale || 0;
      
      // Filtrer selon la plage d'années sélectionnée
      if (annee && annee >= timeRange[0] && annee <= timeRange[1]) {
        if (!yearGroups.has(annee)) {
          yearGroups.set(annee, {
            count: 0,
            total: 0,
            values: [],
          });
        }
        
        const group = yearGroups.get(annee);
        group.count += 1;
        group.total += taux;
        group.values.push(taux);
      }
    });

    // Calculer la moyenne par année
    const annees = [];
    const tauxMoyens = [];

    yearGroups.forEach((value, annee) => {
      annees.push(annee);
      const moyenne = value.total / value.count;
      tauxMoyens.push(moyenne);
    });

    // Trier par année
    const sortedData = annees.map((annee, index) => ({
      annee,
      moyenne: tauxMoyens[index],
    }));

    sortedData.sort((a, b) => a.annee - b.annee);

    return {
      annees: sortedData.map((d) => d.annee),
      moyennes: sortedData.map((d) => d.moyenne),
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

  if (!evolutionData || evolutionData.annees.length === 0) {
    return (
      <div className="w-full flex justify-center p-4">
        <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  const plotData = [
    {
      type: "scatter",
      mode: "lines+markers",
      name: "Taux moyen de couverture vaccinale",
      x: evolutionData.annees,
      y: evolutionData.moyennes,
      line: {
        color: "#3b82f6",
        width: 3,
      },
      marker: {
        color: "#2563eb",
        size: 12,
        line: {
          color: "#1e40af",
          width: 2,
        },
      },
      fill: "tozeroy",
      fillcolor: "rgba(59, 130, 246, 0.1)",
      hovertemplate: 
        "<b>Année %{x}</b><br>" +
        "Couverture moyenne: <b>%{y:.2f}%</b><br>" +
        "<extra></extra>",
    },
  ];

  const layout = {
    title: {
      text: "Évolution annuelle de la couverture vaccinale contre la grippe",
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
        text: "Année",
        font: { size: 14, color: "#4b5563" },
      },
      type: "linear",
      tickmode: "linear",
      dtick: 1,
      range: [2015.5, 2024.5],
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      zeroline: false,
    },
    yaxis: {
      title: "Taux moyen de couverture vaccinale (%)",
      range: [37, 50],
    },
    hovermode: "x unified",
    legend: {
      x: 0.5,
      y: -0.15,
      xanchor: "center",
      orientation: "h",
      bgcolor: "rgba(255, 255, 255, 0.8)",
      bordercolor: "#e5e7eb",
      borderwidth: 1,
      font: { size: 13 },
    },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
    height: 550,
    margin: { t: 100, b: 100, l: 80, r: 40 },
  };

  const moyenne = evolutionData.moyennes.reduce((a, b) => a + b, 0) / evolutionData.moyennes.length;
  const evolution = evolutionData.moyennes[evolutionData.moyennes.length - 1] - evolutionData.moyennes[0];
  const evolutionPercent = ((evolution / evolutionData.moyennes[0]) * 100).toFixed(1);

  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Évolution de la Couverture Vaccinale
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Tendance de la couverture vaccinale contre la grippe de 2016 à 2024
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

