import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { NodeProps } from "@xyflow/react";
import { MousePointer2Icon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenSettings = () => setDialogOpen(true);

  const noseStatus = "initial";

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        icon={MousePointer2Icon}
        label="When Clicked 'Execute Workflow'"
        description="Trigger the workflow when clicked"
        status={noseStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
