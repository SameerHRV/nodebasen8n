"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const SubscriptionPage = () => {
  const trpc = useTRPC();
  const testAi = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("Success");
      },
      onError: ({ message }) => {
        toast.error(message);
      },
    }),
  );

  return <Button onClick={() => testAi.mutate()}>Test AI</Button>;
};

export default SubscriptionPage;

// http://localhost:3000/subscription
