import { credentialsRoute } from "@/features/credentials/server/routers";
import { workflowsRoute } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { executionsRoute } from "@/features/executions/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowsRoute,
  credentials: credentialsRoute,
  executions: executionsRoute,
});
// export type definition of API
export type AppRouter = typeof appRouter;
