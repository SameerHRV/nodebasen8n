"use client";

import { BaseHandle } from "@/components/react-flow/base-handle";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { type NodeProps, Position } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode } from "react";
import { WorkflowNode } from "../../../components/web/workflow-nodes";

interface BaseTriggerNodeProps extends NodeProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description?: string;
  children?: ReactNode;
  // status?: "idle" | "loading" | "success" | "error";
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    id,
    icon: Icon,
    label,
    description,
    children,
    onSettings,
    onDoubleClick,
  }: BaseTriggerNodeProps) => {
    const handleDelete = () => {};
    return (
      <WorkflowNode
        name={label}
        description={description}
        onSetting={onSettings}
        onDelete={handleDelete}
      >
        <BaseNode
          onDoubleClick={onDoubleClick}
          className="rounded-l-2xl relative group"
        >
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
              id={"source-1"}
            />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  },
);

BaseTriggerNode.displayName = "BaseTriggerNode";
