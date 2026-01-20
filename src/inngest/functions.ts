import { google } from "@ai-sdk/google";
import * as Sentry from "@sentry/nextjs";
import { generateText } from "ai";
import { inngest } from "./client";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "execute/execute-workflow" },
  async ({ event, step }) => {
    Sentry.logger.info("USer Triggred test Logs", {
      log_source: "inngest",
    });
    Sentry.metrics.count('test_metric', 1);
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google("gemini-2.5-flash"),
      system: "you are a helpfull assistent.",
      prompt: "Write a vegetarian lasagna recipe for 4 people.",
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });
    return steps;
  },
);
