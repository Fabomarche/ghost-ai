import { createGoogleGenerativeAI } from "@ai-sdk/google";

const DEFAULT_GOOGLE_AI_MODEL = "gemini-2.5-flash-lite";

function getGoogleApiKey(): string {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Google Generative AI API key is missing. Set GOOGLE_AI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
    );
  }

  return apiKey;
}

export const google = createGoogleGenerativeAI({
  apiKey: getGoogleApiKey(),
});

export function getGoogleAiModel(): string {
  return process.env.GOOGLE_AI_MODEL ?? DEFAULT_GOOGLE_AI_MODEL;
}
