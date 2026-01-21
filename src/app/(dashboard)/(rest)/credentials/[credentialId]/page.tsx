import { requireAuth } from "@/lib/auth-utils";

interface CredentialIdProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const CredentialId = async ({ params }: CredentialIdProps) => {
  const { credentialId } = await params;
  await requireAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold">Credential Id: {credentialId}</h1>
    </div>
  );
};

export default CredentialId;
