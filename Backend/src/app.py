"""
Serveur Flask avec endpoint GraphQL pour exposer les données.
Configuration de CORS pour permettre au frontend d'accéder aux queries GraphQL.
"""

from flask import Flask, request, jsonify, render_template_string
from graphql import graphql_sync
from flask_cors import CORS 
from schema import schema
import os
from dotenv import load_dotenv  

load_dotenv()

app = Flask(__name__)

# Récupérer le schéma GraphQL-core depuis le schéma Graphene
graphql_schema = schema.graphql_schema


DEBUG_MODE = os.getenv("FLASK_DEBUG", "True").lower() == "true"
GRAPHQL_PORT = int(os.getenv("GRAPHQL_PORT", '5001'))  # Changé à 5001 car 5000 est utilisé par AirPlay sur macOS

# Activation du Cors pour permettre les requêtes depuis le frontend 
# Configuration globale pour toutes les routes
CORS(app, 
    origins=[
        "http://localhost:3000",      # Frontend Vite (port configuré)
        "http://localhost:5173",      # Frontend Vite (port par défaut)
        "http://localhost:5000",       # Backend (ancien port)
        "http://localhost:5001",       # Backend (nouveau port)
        "http://192.168.1.151:5000",  # Réseau local (ancien port)
        "http://192.168.1.151:5001"   # Réseau local (nouveau port)
    ],
    methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    supports_credentials=True
)

@app.route('/graphql', methods=['GET', 'POST', 'OPTIONS'])
def graphql_route():
    """GraphQL endpoint avec interface GraphiQL"""
    # Gérer les requêtes preflight OPTIONS
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response, 200
    
    # Si GET sans query, retourner l'interface GraphiQL
    if request.method == 'GET':
        query = request.args.get('query')
        if not query:
            # Retourner l'interface GraphiQL
            graphiql_html = '''
<!DOCTYPE html>
<html>
  <head>
    <title>GraphiQL</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      body {
        background: #fafafa;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      #graphiql {
        height: 100vh;
        width: 100vw;
      }
    </style>
    <link href="https://unpkg.com/graphiql@2/graphiql.min.css" rel="stylesheet" />
  </head>
  <body>
    <div id="graphiql"></div>
    <script
      crossorigin
      src="https://unpkg.com/react@18/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>
    <script
      src="https://unpkg.com/graphiql@2/graphiql.min.js"
    ></script>
    <script src="https://unpkg.com/graphiql-explorer/graphiqlExplorer.umd.js"></script>
    <script>
      const root = ReactDOM.createRoot(document.getElementById('graphiql'));
      root.render(
        React.createElement(GraphiQL, {
          fetcher: GraphiQL.createFetcher({
            url: window.location.href,
          }),
          defaultQuery: '# Bienvenue sur GraphiQL\\n# Tapez votre requête GraphQL ici\\n\\n{\\n  statsCouverture\\n  statsUrgences\\n}',
        }),
      );
    </script>
  </body>
</html>
            '''
            return render_template_string(graphiql_html)
        
        variables = request.args.get('variables')
    else:
        data = request.get_json()
        query = data.get('query')
        variables = data.get('variables')
    
    if not query:
        return jsonify({'error': 'No query provided'}), 400
    
    result = graphql_sync(graphql_schema, query, variable_values=variables)
    
    response = {'data': result.data}
    if result.errors:
        response['errors'] = [str(error) for error in result.errors]
    
    return jsonify(response), 200 if not result.errors else 400

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'API GraphQL pour les données de santé publique. Accédez à /graphql pour interagir avec l\'API.',
        'endpoints': {
            'graphql': '/graphql',
            'graphiql': '/graphql'
        }, 
        'docs': 'Utilisez un client GraphQL comme Apollo Studio ou Postman pour interroger l\'API.' 
    }), 200

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Ressource non trouvée'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Erreur interne du serveur'}, 500


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=GRAPHQL_PORT,
        debug=DEBUG_MODE,
        use_reloader=False
    )