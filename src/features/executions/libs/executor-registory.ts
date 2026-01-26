import { manualTriggerExecutor } from "@/features/triggers/components/manual-triggers/executor";
import { NodeType } from "@/generated/prisma/enums";
import { httpRequestExecutor } from "../components/http-request/executor";
import { NodeExecutor } from "../types";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor, //TODO: Fix Types
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor, //TODO: Fix Types
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`Executor not found for type ${type}`);
  }
  return executor;
};
