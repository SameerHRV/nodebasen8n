"use client";

import { type NodeProps, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode, useCallback } from "react";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { WorkflowNode } from "../../../components/web/workflow-nodes";

interface BaseExecutionNodeProps extends NodeProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  children?: ReactNode;
  // status?: "idle" | "loading" | "success" | "error";
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
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    const handleDelete = () => {};
    return (
      <WorkflowNode
        name={label}
        description={description}
        onSetting={onSettings}
        onDelete={handleDelete}
        onDoubleClick={onDoubleClick}
      >
        <BaseNode onDoubleClick={onDoubleClick}>
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
      </WorkflowNode>
    );
  },
);

BaseExecutionNode.displayName = "BaseExecutionNode";
