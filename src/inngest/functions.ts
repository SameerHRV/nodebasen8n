import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "execute/execute-workflow" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "you are a helpfull assistent.",
      prompt: "Write a vegetarian lasagna recipe for 4 people.",
    });
    return steps;
  },
);
