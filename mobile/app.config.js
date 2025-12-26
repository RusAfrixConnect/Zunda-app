import 'dotenv/config';

export default {
  expo: {
    name: "Zunda",
    slug: "zunda-app",
    version: "1.0.0",
    orientation: "portrait",
    // icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ru.zunda.app",
      buildNumber: "1.0.0",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Приложению требуется доступ к фото для загрузки аватара и историй.",
        NSCameraUsageDescription: "Приложению требуется доступ к камере для съемки фото и видео.",
        NSMicrophoneUsageDescription: "Приложению требуется доступ к микрофону для записи видео и live стримов.",
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: ["zunda"]
          }
        ]
      }
    },
    android: {
      package: "ru.zunda.app",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "zunda",
              host: "*"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // URL dynamique pour Codespaces vs local
      API_URL: process.env.API_URL || 
        (process.env.CODESPACES === 'true' ? 
          `https://${process.env.CODESPACE_NAME}-5000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}` : 
          "http://localhost:5000"
        ),
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || "false",
      YOO_SHOP_ID: process.env.YOO_SHOP_ID || "test_shop_id",
      SENTRY_DSN: process.env.SENTRY_DSN || "",
      eas: {
        projectId: "zunda-app-id"
      }
    },
    // SECTION DES PLUGINS SUPPRIMÉE (cause de l'erreur PluginError)
    // Les plugins seront détectés et configurés automatiquement par Expo.
    scheme: "zunda",
    // Configuration spécifique pour Expo Go dans Codespaces
    hostUri: process.env.CODESPACES === 'true' ? 
      `${process.env.CODESPACE_NAME}-8081.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}` : 
      undefined,
    updates: {
      url: "https://u.expo.dev/zunda-app-id"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
};
