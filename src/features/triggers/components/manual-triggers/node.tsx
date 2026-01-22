import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { NodeProps } from "@xyflow/react";
import { MousePointer2Icon } from "lucide-react";

export const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <BaseTriggerNode
      {...props}
      icon={MousePointer2Icon}
      label="When Clicked 'Execute Workflow'"
      // description="Trigger the workflow when clicked"
      // status={noseStatus} TODO: Add status
      // onSettings={handleOpenSettings} TODO: Add settings
      // onDoubleClick={handleOpenSettings} TODO: Add settings
    />
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
