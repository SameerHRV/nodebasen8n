import { getExecutor } from "@/features/executions/libs/executor-registory";
import { NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-from-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { TopologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, //TODO: Remove in production
  },

  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const workflowID = event.data.workflowId;

    if (!workflowID) {
      throw new NonRetriableError("Workflow ID is required");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowID,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return TopologicalSort(workflow.nodes, workflow.connections);
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return {
      workflowID,
      result: context,
    };
  },
);
