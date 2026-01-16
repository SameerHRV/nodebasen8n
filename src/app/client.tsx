"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());
  return (
    <div className="container mx-auto">
      <h1>Client</h1>
      <p>{JSON.stringify(users)}</p>
    </div>
  );
};

export default Client;
