import { manualTriggerExecutor } from "@/features/triggers/components/manual-triggers/executor";
import { NodeType } from "@/generated/prisma/enums";
import { httpRequestExecutor } from "../components/http-request/executor";
import { NodeExecutor } from "../types";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor, //TODO: Fix Types
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor, //TODO: Fix Types
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor, //TODO: Fix Types
  [NodeType.GOOGLE]: geminiExecutor, //TODO: Fix Types
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`Executor not found for type ${type}`);
  }
  return executor;
};
