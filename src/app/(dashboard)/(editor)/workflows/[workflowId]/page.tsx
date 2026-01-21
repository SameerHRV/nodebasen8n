import { requireAuth } from "@/lib/auth-utils";

interface WorkflowIdProps {
  params: Promise<{
    workflowId: string;
  }>;
}

const WorkflowId = async ({ params }: WorkflowIdProps) => {
  const { workflowId } = await params;
  await requireAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Workflow Id: {workflowId}</h1>
    </div>
  );
};

export default WorkflowId;
