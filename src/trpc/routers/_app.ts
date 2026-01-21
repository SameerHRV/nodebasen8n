import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "../init";

export const appRouter = createTRPCRouter({
  testAi: premiumProcedure.mutation(async () => {
    await inngest.send({
      name: "execute/execute-workflow",
    });

    return { success: true, Message: "Job Queued" };
  }),
  getWorkflows: protectedProcedure.query(() => {
    return prisma.workflow.findMany();
  }),
  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "test/hello.world",
      data: {
        email: "test@example.com",
      },
    });
    return prisma.workflow.create({
      data: {
        name: "test",
      },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
