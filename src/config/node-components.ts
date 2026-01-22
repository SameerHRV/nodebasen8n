import { InitialNode } from "@/components/web/initial-node";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisterNodeType = keyof typeof nodeComponents;
