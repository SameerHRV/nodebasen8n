import { requireAuth } from "@/lib/auth-utils";

interface ExecutionIdProps {
  params: Promise<{
    executionId: string;
  }>;
}

const ExecutionId = async ({ params }: ExecutionIdProps) => {
  const { executionId } = await params;
  await requireAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Execution Id: {executionId}</h1>
    </div>
  );
};

export default ExecutionId;
