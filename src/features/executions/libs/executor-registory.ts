import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-triggers/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { NodeType } from "@/generated/prisma/enums";
import { discordExecutor } from "../components/discord/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { NodeExecutor } from "../types";
import { slackExecutor } from "../components/slack/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor, //TODO: Fix Types
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor, //TODO: Fix Types
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor, //TODO: Fix Types
  [NodeType.GOOGLE]: geminiExecutor, //TODO: Fix Types
  [NodeType.DISCORD]: discordExecutor, //TODO: Fix Types
  [NodeType.SLACK]: slackExecutor, //TODO: Fix Types
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`Executor not found for type ${type}`);
  }
  return executor;
};
