"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const HomeClient = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow created successfully");
      },
    }),
  );
  return (
    <div className="w-full h-screen flex items-center justify-center flex-col">
      <div>
        <h1>Protected Page</h1>
      </div>
      <p>{JSON.stringify(data, null, 2)}</p>
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create Workflow
      </Button>
    </div>
  );
};

export default HomeClient;

