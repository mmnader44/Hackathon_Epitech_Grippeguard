import { useState, useEffect } from 'react'
import { graphqlRequest } from '../lib/graphql'

/**
 * Hook personnalisé pour exécuter des requêtes GraphQL
 * @param {string} query - La requête GraphQL
 * @param {object} variables - Les variables de la requête
 * @param {boolean} skip - Si true, la requête n'est pas exécutée
 * @returns {object} { data, error, loading, refetch }
 */
export function useGraphQL(query, variables = {}, skip = false) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!skip)

  const fetchData = async () => {
    if (skip) return
    
    setLoading(true)
    setError(null)
    
    const result = await graphqlRequest(query, variables)
    
    if (result.error) {
      setError(result.error)
      setData(null)
    } else {
      setData(result.data)
      setError(null)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip])

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  }
}

/**
 * Hook pour récupérer les statistiques
 */
export function useStats() {
  const statsUrgences = useGraphQL(`
    query {
      statsUrgences
    }
  `)
  
  const statsCouverture = useGraphQL(`
    query {
      statsCouverture
    }
  `)

  return {
    urgences: statsUrgences.data?.statsUrgences || 0,
    couverture: statsCouverture.data?.statsCouverture || 0,
    loading: statsUrgences.loading || statsCouverture.loading,
    error: statsUrgences.error || statsCouverture.error,
  }
}

