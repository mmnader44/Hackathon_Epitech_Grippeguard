import { useState } from "react";
import { Filter } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/ui/button";
import UrgencesHospitalisationsComparison from "../components/charts/UrgencesHospitalisationsComparison";
import CouvertureAnnuelleEvolution from "../components/charts/CouvertureAnnuelleEvolution";
import UrgencesParAnnee from "../components/charts/UrgencesParAnnee";
import Top10DepartementsFaibleCouverture from "../components/charts/Top10DepartementsFaibleCouverture";
import ChoroplethMap from "../components/charts/ChloropeteMap";
import ChoroplethHospitalisations from "../components/charts/ChoroplethHospitalisations";
import ChoroplethUrgences from "../components/charts/ChoroplethUrgences";
import ChoroplethPharmacies from "../components/charts/ChoroplethPharmacies";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: [2016, 2024],
    selectedMap1: "couverture",
    selectedMap2: "hospitalisations",
  });

  // Mapping des cartes
  const mapComponents = {
    couverture: <ChoroplethMap timeRange={filters.timeRange} />,
    hospitalisations: (
      <ChoroplethHospitalisations timeRange={filters.timeRange} />
    ),
    urgences: <ChoroplethUrgences timeRange={filters.timeRange} />,
    pharmacies: <ChoroplethPharmacies />,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
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
            <div className="mx-auto space-y-8 grid grid-cols-3 gap-6">
              {/* Grille pour les 2 cartes sélectionnées */}
              <div className="flex flex-col gap-6 mb-0 col-span-1">
                {mapComponents[filters.selectedMap1] && (
                  <div className="w-full h-[750px]">
                    {mapComponents[filters.selectedMap1]}
                  </div>
                )}
                {mapComponents[filters.selectedMap2] && (
                  <div className="w-full h-[750px]">
                    {mapComponents[filters.selectedMap2]}
                  </div>
                )}
              </div>

              {/* Autres graphiques */}
              <div className="grid grid-cols-2 grid-rows-2 gap-6 col-span-2">
                <div className="h-[750px]">
                  <UrgencesHospitalisationsComparison />
                </div>
                <div className="h-[750px]">
                  <CouvertureAnnuelleEvolution timeRange={filters.timeRange} />
                </div>
                <div className="h-[750px]">
                  <UrgencesParAnnee timeRange={filters.timeRange} />
                </div>
                <div className="h-[750px]">
                  <Top10DepartementsFaibleCouverture timeRange={filters.timeRange} />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;
