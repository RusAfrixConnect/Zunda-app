#!/bin/bash

echo "🚀 Démarrage de Zunda App dans Codespaces..."

# Démarrer les bases de données
echo "📦 Démarrage de PostgreSQL et Redis..."
docker-compose -f .devcontainer/docker-compose.yml up -d

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 5

# Initialiser la base de données
echo "🗄️  Initialisation de la base de données..."
cd backend
npm install
node database/init.js

# Démarrer le backend
echo "⚡ Démarrage du backend..."
npm run dev &

# Démarrer le frontend mobile
echo "📱 Démarrage de l'app mobile..."
cd ../mobile
npm install
expo start --tunnel &

echo "✅ Démarrage terminé!"
echo "👉 Backend: http://localhost:5000"
echo "👉 Expo DevTools: http://localhost:8081"
echo "👉 Scanner le QR code avec Expo Go"
