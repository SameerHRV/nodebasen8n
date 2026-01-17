import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("fetching", "5s");
    await step.sleep("Transcription", "5s");
    await step.sleep("sending-to-ai", "5s");

    await prisma.workflow.create({
      data: {
        name: "workflow-for-inngest",
      },
    });
  },
);
