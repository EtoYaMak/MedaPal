module.exports = {
  expo: {
    name: "MedPal",
    slug: "MedPal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    plugins: ["expo-router"],
    scheme: "medpal",
  },
};
