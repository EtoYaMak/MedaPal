import OpenAI from "openai";

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OpenAI API key is missing. Please check your environment variables."
  );
}

if (!apiKey.startsWith('sk-')) {
  throw new Error(
    "Invalid OpenAI API key format. Please check your API key."
  );
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
  baseURL: "https://api.openai.com/v1",
});
