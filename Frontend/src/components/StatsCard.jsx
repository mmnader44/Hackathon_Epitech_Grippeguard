import { useStats } from '../hooks/useGraphQL'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Activity, TrendingUp, Loader2, AlertCircle } from 'lucide-react'

const StatsCard = () => {
  const { urgences, couverture, loading, error } = useStats()

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Erreur de connexion au backend</p>
          </div>
          <p className="text-xs text-red-500 mt-2">
            Assurez-vous que le backend est démarré sur le port 5001
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Taux moyen de grippe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {urgences.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Passages aux urgences
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Couverture vaccinale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {couverture.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Taux moyen de vaccination
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default StatsCard

