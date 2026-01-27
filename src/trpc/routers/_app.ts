import { credentialsRoute } from "@/features/credentials/server/routers";
import { workflowsRoute } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  workflows: workflowsRoute,
  credentials: credentialsRoute,
});
// export type definition of API
export type AppRouter = typeof appRouter;
