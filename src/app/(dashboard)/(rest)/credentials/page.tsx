import { requireAuth } from "@/lib/auth-utils";

const CredentialsPage = async () => {
  await requireAuth();
  return (
    <div>
      <h1>CredentialsPage</h1>
    </div>
  );
};

export default CredentialsPage;
