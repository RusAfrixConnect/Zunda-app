// app.config.js SIMPLIFIÉ
export default {
  expo: {
    name: "Zunda",
    slug: "zunda-app",
    version: "1.0.0",
    
    // ESSENTIEL: Désactive les stats pour éviter l'erreur GraphQL
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
    
    // Variables d'environnement (sans dotenv pour l'instant)
    extra: {
      API_URL: "http://localhost:5000",
      ENABLE_ANALYTICS: "false"
    }
  }
};
