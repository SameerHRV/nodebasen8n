"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { WorkflowNode } from "../../../components/web/workflow-nodes";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";

interface BaseExecutionNodeProps extends NodeProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  children?: ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    icon: Icon,
    label,
    description,
    children,
    status = "initial",
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updateNodes = currentNodes.filter((node) => node.id !== id);
        return updateNodes;
      });
      setEdges((currentEdges) => {
        const updateEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );

        return updateEdges;
      });
    };
    return (
      <WorkflowNode
        name={label}
        description={description}
        onSetting={onSettings}
        onDelete={handleDelete}
        onDoubleClick={onDoubleClick}
      >
        <NodeStatusIndicator status={status}>
          <BaseNode onDoubleClick={onDoubleClick} status={status}>
            <BaseNodeContent>
              {typeof Icon === "string" ? (
                <Image src={Icon} alt={label} width={16} height={16} />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              {children}
              <BaseHandle
                type="source"
                position={Position.Right}
                id={"target-1"}
              />
              <BaseHandle
                type="target"
                position={Position.Left}
                id={"source-1"}
              />
            </BaseNodeContent>
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";
