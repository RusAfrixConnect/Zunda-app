import 'dotenv/config';

export default {
  expo: {
    // ====================
    // CONFIGURATION DE BASE
    // ====================
    name: "Zunda",
    slug: "zunda-app",
    version: "1.0.0",
    orientation: "portrait",
    
    // ====================
    // ICÔNES & SPLASH SCREEN
    // ====================
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF3B30"
    },
    
    // ====================
    // ASSETS & BUILD
    // ====================
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
    
    // ====================
    // ENVIRONNEMENT & VARIABLES
    // ====================
    extra: {
      API_URL: process.env.API_URL || "http://localhost:5000",
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS || "false"
    },
    
    // ====================
    // IMPORTANT: DÉSACTIVER LES STATS
    // ====================
    stats: {
      enabled: false
    },
    
    // ====================
    // PLUGINS (COMMENTÉS TEMPORAIREMENT)
    // ====================
    /* 
    plugins: [
      [
        "expo-image-picker",
        {
          photosPermission: "Приложению требуется доступ к вашим фото.",
          cameraPermission: "Приложению требуется доступ к вашей камере."
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Показывать ваше местоположение другим пользователям."
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff"
        }
      ],
      [
        "expo-av",
        {
          microphonePermission: "Приложению требуется доступ к микрофону для live стримов."
        }
      ]
    ],
    */
    
    // ====================
    // CONFIGURATION AVANCÉE
    // ====================
    scheme: "zunda"
  }
};
