import { requireAuth } from "@/lib/auth-utils";

const ExecutionsPage = async () => {
  await requireAuth();
  return (
    <div>
      <h1>ExecutionsPage</h1>
    </div>
  );
};

export default ExecutionsPage;
