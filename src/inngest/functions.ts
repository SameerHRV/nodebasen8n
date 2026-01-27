import { getExecutor } from "@/features/executions/libs/executor-registory";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";
import { geminiChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-from-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { inngest } from "./client";
import { TopologicalSort } from "./utils";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0, //TODO: Remove in production
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },

  {
    event: "workflow/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowID = event.data.workflowId;

    if (!inngestEventId || !workflowID) {
      throw new NonRetriableError("Event ID or Workflow ID is required");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId: workflowID,
          inngestEventId,
        },
      });
    });

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

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowID,
        },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    let context = event.data.initialData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });
    }

    await step.run("update-execution", async () => {
      await prisma.execution.update({
        where: {
          inngestEventId,
          workflowId: workflowID,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return {
      workflowID,
      result: context,
    };
  },
);
