import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.credentials.getMany>;

/**
 * Prefetch all credentials
 * @param params
 */
export function prefetchCredentials(params: Input) {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
}

/**
 * Prefetch a single credential
 * @param id
 */
export function prefetchCredential(id: string) {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
}
