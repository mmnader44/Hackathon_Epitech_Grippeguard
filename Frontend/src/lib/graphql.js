import { GraphQLClient } from 'graphql-request'

// Configuration de l'URL du backend GraphQL
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5001/graphql'

// Création du client GraphQL
export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Exécute une requête GraphQL
 * @param {string} query - La requête GraphQL
 * @param {object} variables - Les variables de la requête (optionnel)
 * @returns {Promise} Les données retournées
 */
export async function graphqlRequest(query, variables = {}) {
  try {
    const data = await graphqlClient.request(query, variables)
    return { data, error: null }
  } catch (error) {
    console.error('GraphQL Error:', error)
    return { data: null, error }
  }
}

// Requêtes GraphQL prédéfinies

/**
 * Récupère les statistiques d'urgences
 */
export const GET_STATS_URGENCES = `
  query {
    statsUrgences
  }
`

/**
 * Récupère les statistiques de couverture
 */
export const GET_STATS_COUVERTURE = `
  query {
    statsCouverture
  }
`

/**
 * Récupère toutes les urgences (avec pagination)
 */
export const GET_URGENCES = `
  query GetUrgences($first: Int, $after: String) {
    tousUrgencesPagined(first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          code
          nom
          date
          semaine
          classeAge
          region
          tauxGrippe
          tauxHospitalisation
          tauxSosMedecins
        }
      }
    }
  }
`

/**
 * Récupère toutes les couvertures (avec pagination)
 */
export const GET_COUVERTURES = `
  query GetCouvertures($first: Int, $after: String) {
    toutesCouverturesPagined(first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          code
          nom
          annee
          grippeTotale
          grippeMoins65Risque
          grippe65Plus
          region
          geometry
        }
      }
    }
  }
`

/**
 * Récupère toutes les pharmacies
 */
export const GET_PHARMACIES = `
  query GetPharmacies($first: Int, $after: String) {
    tousPharmaciesPagined(first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          code
          nom
          nombrePharmacies
          geometry
        }
      }
    }
  }
`

/**
 * Récupère les urgences par département
 */
export const GET_URGENCES_BY_DEPARTMENT = `
  query GetUrgencesByDepartment($code: String!) {
    urgencesParDepartement(code: $code) {
      code
      nom
      date
      tauxGrippe
      tauxHospitalisation
      tauxSosMedecins
    }
  }
`

/**
 * Récupère les couvertures par département
 */
export const GET_COUVERTURES_BY_DEPARTMENT = `
  query GetCouverturesByDepartment($code: String!) {
    couverturesParDepartement(code: $code) {
      code
      nom
      annee
      grippeTotale
      grippe65Plus
      region
    }
  }
`

