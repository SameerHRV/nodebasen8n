import { Button } from "@/components/ui/button";
import { FlaskConicalIcon } from "lucide-react";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";

export const ExecuteWorkflowButton = ({ workflow }: { workflow: string }) => {
  const executeWorkflow = useExecuteWorkflow();

  const handleExecuteWorkflow = () => {
    executeWorkflow.mutate({ id: workflow });
  };

  return (
    <Button
      size={"lg"}
      disabled={executeWorkflow.isPending}
      onClick={handleExecuteWorkflow}
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
};
