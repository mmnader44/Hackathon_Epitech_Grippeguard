import { useState } from "react";
import { Filter, TrendingUp, Calendar, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { graphqlRequest } from "../lib/graphql";

const Prediction = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [anneeDebut, setAnneeDebut] = useState(new Date().getFullYear());
  const [typePrediction, setTypePrediction] = useState("doses");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effectuer la prédiction
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    // Validation : l'année doit être >= 2025
    if (anneeDebut < 2025) {
      setError("L'année de début de la campagne doit être supérieure ou égale à 2025. Les prédictions ne sont disponibles que pour les années futures.");
      setLoading(false);
      return;
    }

    try {
      const query = `
        query PredireCampagne($anneeDebut: Int!, $typePrediction: String!) {
          predireCampagne(anneeDebut: $anneeDebut, typePrediction: $typePrediction) {
            campagne
            anneeDebut
            valeurPredite
            typePrediction
          }
        }
      `;

      const variables = {
        anneeDebut: anneeDebut,
        typePrediction: typePrediction,
      };

      const result = await graphqlRequest(query, variables);

      if (result.error) {
        throw result.error;
      }

      if (result.data?.predireCampagne) {
        setPrediction(result.data.predireCampagne);
      }
    } catch (err) {
      console.error("Erreur lors de la prédiction:", err);
      setError(
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Une erreur est survenue lors de la prédiction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          showFilters={false}
        />

        {/* Bouton pour ouvrir la sidebar sur mobile */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-40 md:hidden shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Filter className="h-5 w-5" />
        </Button>

        {/* Contenu principal */}
        <main className="flex-1 md:ml-80 transition-all duration-300">
          <section className="w-full py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* En-tête */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Prédictions de campagnes vaccinales
              </h1>
              <p className="text-gray-600">
                  Prédisez les besoins en doses ou actes vaccinaux pour les futures campagnes de vaccination contre la grippe
                </p>
              </div>

              {/* Formulaire de prédiction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Paramètres de prédiction
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez l'année de début et le type de prédiction souhaité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sélection de l'année */}
                    <div className="space-y-2">
                      <label htmlFor="annee" className="text-sm font-medium text-gray-700">
                        Année de début de la campagne
                      </label>
                      <input
                        id="annee"
                        type="number"
                        min={new Date().getFullYear() + 1}
                        max={new Date().getFullYear() + 10}
                        value={anneeDebut}
                        onChange={(e) => {
                          setAnneeDebut(parseInt(e.target.value) || new Date().getFullYear() + 1);
                          setError(null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500">
                        Ex: {anneeDebut} pour la campagne {anneeDebut}-{anneeDebut + 1}
                      </p>
                    </div>

                    {/* Sélection du type */}
                    <div className="space-y-2">
                      <label htmlFor="type" className="text-sm font-medium text-gray-700">
                        Type de prédiction
                      </label>
                      <select
                        id="type"
                        value={typePrediction}
                        onChange={(e) => setTypePrediction(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="doses">Doses (DOSES J07E1)</option>
                        <option value="actes">Actes (ACTE VGP)</option>
                      </select>
                      <p className="text-xs text-gray-500">
                        Choisissez entre doses administrées ou actes vaccinaux
                      </p>
                    </div>
                  </div>

                  {/* Bouton de prédiction */}
                  <div className="mt-6">
                    <Button
                      onClick={handlePredict}
                      disabled={loading}
                      className="w-full md:w-auto"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Prédiction en cours...
                        </>
                      ) : (
                        <>
                          Effectuer la prédiction
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Affichage des erreurs */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Erreur de prédiction</p>
                        <p className="text-sm text-red-500 mt-1">{error}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Résultat de la prédiction */}
              {prediction && (
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      Prédiction réussie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Campagne</p>
                        <p className="text-2xl font-bold text-gray-900">{prediction.campagne}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Type</p>
                        <p className="text-2xl font-bold text-blue-600 capitalize">
                          {prediction.typePrediction === "doses" ? "Doses" : "Actes"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">Valeur prédite</p>
                        <p className="text-2xl font-bold text-green-600">
                          {prediction.valeurPredite.toLocaleString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Prediction;
