import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const usePayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActivePayment = () => {
  const { data: customerState, isLoading, ...rest } = usePayments();

  const hasActivePayment =
    customerState?.activeSubscriptions &&
    customerState.activeSubscriptions.length > 0;

  return {
    hasActivePayment,
    subscription: customerState?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};
