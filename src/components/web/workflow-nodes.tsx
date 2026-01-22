"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";

interface WorkflowNodeProps {
  children: ReactNode;
  showToolBar?: boolean;
  onDelete?: () => void;
  onSetting?: () => void;
  name?: string;
  discription?: string;
}

export const WorkflowNode = ({
  children,
  discription,
  name,
  onDelete,
  onSetting,
  showToolBar = true,
}: WorkflowNodeProps) => {
  return (
    <>
      {showToolBar && (
        <NodeToolbar>
          <Button size={"sm"} variant={"ghost"} onClick={onSetting}>
            <SettingsIcon className="size-4" />
          </Button>
          <Button size={"sm"} variant={"ghost"} onClick={onDelete}>
            <TrashIcon className="size-4" />
          </Button>
        </NodeToolbar>
      )}
      {children}
      {name && (
        <NodeToolbar
          position={Position.Bottom}
          isVisible
          className="max-w-[200px] text-center"
        >
          <p className="font-medium">{name}</p>
          {discription && (
            <p className="text-muted-foreground truncate text-sm">
              {discription}
            </p>
          )}
        </NodeToolbar>
      )}
    </>
  );
};
