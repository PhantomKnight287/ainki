import {
  customProvider,
} from "ai";
import { isTestEnvironment } from "../constants";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey:process.env.OPENROUTER_API_KEY,
})

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        "chat-model": openrouter("google/gemini-2.5-flash-lite"),
        "chat-model-reasoning": openrouter("google/gemini-2.5-flash-lite"),
        "title-model": openrouter("google/gemini-2.5-flash-lite"),
        "artifact-model": openrouter("google/gemini-2.5-flash-lite"),
      },
    });
