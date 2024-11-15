import Constants from "expo-constants";

export const ENV = {
  OPENAI_API_KEY: Constants.expoConfig?.extra?.openAI || "",
};
