import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Home = async () => {
  await requireAuth();

  const data = await caller.getUsers();
  return (
    <div>
      <h1>Protected Page</h1>
      <p>User: {JSON.stringify(data)}</p>
    </div>
  );
};

export default Home;
