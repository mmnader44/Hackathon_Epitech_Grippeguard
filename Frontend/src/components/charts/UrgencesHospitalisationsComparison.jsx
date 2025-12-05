import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, TrendingUp, Activity } from "lucide-react";

export default function UrgencesHospitalisationsComparison() {
  const { data, loading, error } = useGraphQL(`
    query {
      tousUrgences {
        classeAge
        tauxGrippe
        tauxHospitalisation
      }
    }
  `);

  // Grouper les données par tranche d'âge et calculer les moyennes
  const histogramData = useMemo(() => {
    if (!data?.tousUrgences || data.tousUrgences.length === 0) {
      return null;
    }

    // Grouper par tranche d'âge
    const ageGroups = new Map();
    
    data.tousUrgences.forEach((item) => {
      const ageGroup = item.classeAge || "Non spécifié";
      const tauxUrgences = item.tauxGrippe || 0;
      const tauxHospitalisations = item.tauxHospitalisation || 0;
      
      if (!ageGroups.has(ageGroup)) {
        ageGroups.set(ageGroup, {
          count: 0,
          totalUrgences: 0,
          totalHospitalisations: 0,
        });
      }
      
      const group = ageGroups.get(ageGroup);
      group.count += 1;
      group.totalUrgences += tauxUrgences;
      group.totalHospitalisations += tauxHospitalisations;
    });

    // Calculer les moyennes par tranche d'âge
    const ages = [];
    const tauxUrgencesMoyens = [];
    const tauxHospitalisationsMoyens = [];

    ageGroups.forEach((value, ageGroup) => {
      ages.push(ageGroup);
      tauxUrgencesMoyens.push(value.totalUrgences / value.count);
      tauxHospitalisationsMoyens.push(value.totalHospitalisations / value.count);
    });

    // Trier les tranches d'âge de manière logique
    const ageOrder = [
      "00-04 ans",
      "05-14 ans",
      "15-64 ans",
      "65 ans ou plus",
      "Tous âges",
    ];

    const sortedData = ages.map((age, index) => ({
      age,
      tauxUrgences: tauxUrgencesMoyens[index],
      tauxHospitalisations: tauxHospitalisationsMoyens[index],
      order: ageOrder.indexOf(age) !== -1 ? ageOrder.indexOf(age) : 999,
    }));

    sortedData.sort((a, b) => a.order - b.order);

    return {
      ages: sortedData.map((d) => d.age),
      tauxUrgences: sortedData.map((d) => d.tauxUrgences),
      tauxHospitalisations: sortedData.map((d) => d.tauxHospitalisations),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Chargement des données...
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
            Impossible de charger les données
          </p>
        </div>
      </div>
    );
  }

  if (!histogramData) {
    return (
      <div className="w-full flex justify-center p-4">
        <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  // Couleurs modernes et cohérentes
  const colorUrgences = "#3b82f6";      // Bleu moderne
  const colorHospitalisations = "#ef4444"; // Rouge moderne

  const plotData = [
    {
      type: "bar",
      name: "Passages aux urgences",
      x: histogramData.ages,
      y: histogramData.tauxUrgences,
      marker: {
        color: colorUrgences,
        line: {
          color: "#1e40af",
          width: 1.5,
        },
        opacity: 0.9,
      },
      text: histogramData.tauxUrgences.map((taux) => `${taux.toFixed(1)}%`),
      textposition: "outside",
      textfont: {
        size: 11,
        color: "#1e40af",
      },
      hovertemplate: 
        "<b>%{x}</b><br>" +
        "Passages aux urgences: <b>%{y:.2f}%</b><br>" +
        "<extra></extra>",
    },
    {
      type: "bar",
      name: "Hospitalisations",
      x: histogramData.ages,
      y: histogramData.tauxHospitalisations,
      marker: {
        color: colorHospitalisations,
        line: {
          color: "#991b1b",
          width: 1.5,
        },
        opacity: 0.9,
      },
      text: histogramData.tauxHospitalisations.map((taux) => `${taux.toFixed(1)}%`),
      textposition: "outside",
      textfont: {
        size: 11,
        color: "#991b1b",
      },
      hovertemplate: 
        "<b>%{x}</b><br>" +
        "Hospitalisations: <b>%{y:.2f}%</b><br>" +
        "<extra></extra>",
    },
  ];

  const layout = {
    title: {
      text: "Comparaison des taux de passages aux urgences et d'hospitalisations pour grippe par tranche d'âge",
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
        text: "Tranche d'âge",
        font: { size: 14, color: "#4b5563" },
      },
      tickangle: -45,
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      zeroline: false,
    },
    yaxis: {
      title: {
        text: "Taux moyen (%)",
        font: { size: 14, color: "#4b5563" },
      },
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      zeroline: true,
      zerolinecolor: "#9ca3af",
      zerolinewidth: 2,
    },
    barmode: "group",
    bargap: 0.3, // Espacement entre les groupes de barres
    bargroupgap: 0.1, // Espacement entre les barres dans un groupe
    legend: {
      x: 0.5,
      y: 1.05,
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
    margin: { t: 120, b: 120, l: 80, r: 40 },
    hovermode: "x unified",
  };

  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        {/* Card container avec ombre et padding */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          {/* En-tête avec icônes et description */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Comparaison Urgences vs Hospitalisations
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Analyse comparative des taux de passages aux urgences et d'hospitalisations 
              pour la grippe selon les tranches d'âge
            </p>
          </div>

          {/* Graphique */}
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

