import { requireAuth } from "@/lib/auth-utils";

const WorkFlowPage = async () => {
  await requireAuth();

  return (
    <div>
      <h1>WorkFlowPage</h1>
    </div>
  );
};

export default WorkFlowPage;
