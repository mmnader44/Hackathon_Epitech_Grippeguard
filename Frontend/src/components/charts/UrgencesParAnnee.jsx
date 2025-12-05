import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { useGraphQL } from "../../hooks/useGraphQL";
import { Loader2, AlertCircle, BarChart3 } from "lucide-react";

export default function UrgencesParAnnee({ timeRange = [2016, 2024] }) {
  const { data, loading, error } = useGraphQL(`
    query {
      tousUrgences {
        date
        classeAge
        tauxGrippe
      }
    }
  `);

  // Grouper les données par date et par classe d'âge
  const evolutionData = useMemo(() => {
    if (!data?.tousUrgences || data.tousUrgences.length === 0) {
      return null;
    }

    // Structure: { date: { classeAge: { count, total } } }
    const dateAgeGroups = new Map();
    const validAges = ["00-04 ans", "05-14 ans", "15-64 ans", "65 ans ou plus", "Tous âges"];
    
    data.tousUrgences.forEach((item) => {
      const dateStr = item.date;
      const classeAge = item.classeAge || "Non spécifié";
      const taux = item.tauxGrippe || 0;
      
      // Parser la date
      let date = null;
      if (dateStr) {
        try {
          date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            // Essayer d'autres formats
            const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
              date = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
            }
          }
        } catch (e) {
          // Ignorer les dates invalides
        }
      }
      
      // Filtrer les classes d'âge valides et la plage d'années
      const year = date ? date.getFullYear() : null;
      if (date && !isNaN(date.getTime()) && validAges.includes(classeAge) && year >= timeRange[0] && year <= timeRange[1]) {
        const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        if (!dateAgeGroups.has(dateKey)) {
          dateAgeGroups.set(dateKey, new Map());
        }
        
        const dateMap = dateAgeGroups.get(dateKey);
        if (!dateMap.has(classeAge)) {
          dateMap.set(classeAge, {
            count: 0,
            total: 0,
          });
        }
        
        // Agréger les valeurs (moyenne des départements pour cette date/classe d'âge)
        const ageGroup = dateMap.get(classeAge);
        ageGroup.count += 1;
        ageGroup.total += taux;
      }
    });

    // Extraire toutes les dates et les trier
    const dates = Array.from(dateAgeGroups.keys()).sort();
    
    // Construire les données pour chaque classe d'âge
    const seriesData = {};
    
    validAges.forEach((classeAge) => {
      seriesData[classeAge] = {
        dates: [],
        taux: [],
      };
      
      dates.forEach((dateKey) => {
        const dateMap = dateAgeGroups.get(dateKey);
        seriesData[classeAge].dates.push(dateKey);
        if (dateMap && dateMap.has(classeAge)) {
          const group = dateMap.get(classeAge);
          const moyenne = group.total / group.count;
          seriesData[classeAge].taux.push(moyenne);
        } else {
          seriesData[classeAge].taux.push(0);
        }
      });
    });

    // Calculer la moyenne des taux pour chaque classe d'âge pour déterminer l'ordre d'empilement
    const ageAverages = {};
    validAges.forEach((classeAge) => {
      const data = seriesData[classeAge];
      if (data.taux.length > 0) {
        const sum = data.taux.reduce((a, b) => a + b, 0);
        ageAverages[classeAge] = sum / data.taux.length;
      } else {
        ageAverages[classeAge] = 0;
      }
    });

    // Trier les classes d'âge par taux moyen croissant (les plus bas en premier = arrière-plan)
    // Créer une copie pour ne pas muter validAges
    const sortedAges = [...validAges].sort((a, b) => ageAverages[a] - ageAverages[b]);

    return {
      dates,
      seriesData,
              stackingOrder: sortedAges, // Ordre dynamique selon les taux moyens
            };
          }, [data, timeRange]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-sm text-muted-foreground">
            Chargement des données d'urgences...
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

  if (!evolutionData || evolutionData.dates.length === 0) {
    return (
      <div className="w-full flex justify-center p-4">
        <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  // Couleurs pour chaque classe d'âge (selon l'image exacte)
  const colors = {
    "00-04 ans": "#1f77b4",      // Teal/cyan (bleu-vert)
    "05-14 ans": "#ff7f0e",       // Orange
    "15-64 ans": "#9467bd",       // Violet/bleu
    "65 ans ou plus": "#e377c2",  // Rose/magenta
    "Tous âges": "#bcbd22",       // Vert olive (base)
  };

  // Ordre d'empilement dynamique : les taux les plus bas en arrière-plan (en bas), les plus élevés au premier plan (en haut)
  const stackingOrder = evolutionData.stackingOrder || ["Tous âges", "15-64 ans", "05-14 ans", "00-04 ans", "65 ans ou plus"];
  
  // Ordre d'affichage dans la légende (selon l'image : 00-04, 05-14, 15-64, 65+, Tous âges)
  const legendOrder = ["00-04 ans", "05-14 ans", "15-64 ans", "65 ans ou plus", "Tous âges"];

  // Créer toutes les traces d'abord
  const allTraces = {};
  stackingOrder.forEach((classeAge) => {
    const data = evolutionData.seriesData[classeAge];
    allTraces[classeAge] = {
      type: "bar",
      name: classeAge,
      x: data.dates,
      y: data.taux,
      marker: {
        color: colors[classeAge],
        line: {
          width: 0,
        },
      },
      hovertemplate: `Classe d'âge: ${classeAge}<br>Date: %{x}<br>Taux: %{y:.2f}%<extra></extra>`,
    };
  });

  // Créer plotData dans l'ordre d'empilement (du plus bas au plus élevé = de bas en haut)
  // L'ordre des traces détermine l'ordre d'empilement avec barmode: "stack"
  const plotData = stackingOrder.map((classeAge) => allTraces[classeAge]);

  const layout = {
    title: {
      text: "Taux de passages aux urgences pour la grippe par date et par classe d'âge",
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
        text: "Date",
        font: { size: 14, color: "#4b5563" },
      },
      type: "date",
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      zeroline: false,
    },
    yaxis: {
      title: {
        text: "Taux de passages aux urgences pour grippe (%)",
        font: { size: 14, color: "#4b5563" },
      },
      range: [0, 300],
      showgrid: true,
      gridcolor: "#e5e7eb",
      gridwidth: 1,
      dtick: 50,
      zeroline: true,
      zerolinecolor: "#9ca3af",
      zerolinewidth: 2,
    },
    barmode: "stack",
    hovermode: "x unified",
    legend: {
      title: {
        text: "Classe d'âge",
        font: { size: 13 },
      },
      x: 1.02,
      y: 1,
      xanchor: "left",
      yanchor: "top",
      bgcolor: "rgba(255,255,255,0.95)",
      bordercolor: "#e5e7eb",
      borderwidth: 1,
      traceorder: "normal",
      itemsizing: "constant",
      font: { size: 12 },
    },
    height: 550,
    margin: { t: 100, b: 60, l: 100, r: 150 },
    plot_bgcolor: "white",
    paper_bgcolor: "white",
  };

  return (
    <section className="w-full h-full">
      <div className="w-full h-full flex flex-col">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 flex flex-col flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Urgences par Année et Classe d'Âge
              </h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Évolution temporelle des taux de passages aux urgences pour la grippe, 
              décomposée par tranche d'âge
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

