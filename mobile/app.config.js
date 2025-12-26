cd /workspaces/Zunda-app/mobile

# Backup de ta config actuelle
cp app.config.js app.config.js.backup

# Crée une version qui NE DEPEND PAS de dotenv
cat > app.config.js << 'EOF'
export default {
  expo: {
    // Configuration minimale
    name: "Zunda",
    slug: "zunda-app", 
    version: "1.0.0",
    
    // ESSENTIEL: Désactive les stats pour éviter GraphQL
    stats: {
      enabled: false
    },
    
    // Configuration de base
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ru.zunda.app",
      buildNumber: "1.0.0"
    },
    
    android: {
      package: "ru.zunda.app",
      versionCode: 1
    },
    
    // Variables codées en dur POUR L'INSTANT
    extra: {
      API_URL: "http://localhost:5000",
      ENABLE_ANALYTICS: "false"
    }
  }
};
EOF
