"use client";

import {
  EntityContainer,
  EntityHeader,
} from "@/components/web/entity-components";
import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useUpgradeModel } from "@/hooks/use-upgrade-model";
import { useRouter } from "next/navigation";

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <div className="flex flex-1 justify-center items-center">
      <p>{JSON.stringify(workflows.data, null, 2)}</p>
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled: boolean }) => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, model } = useUpgradeModel();
  const router = useRouter();

  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {model}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        disabled={disabled}
        onNew={handleCreateWorkflow}
        newButtonLable="New Workflow"
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader disabled={false} />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
