import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const stripeData = {
      eventId: body.eventId,
      eventType: body.type,
      timestamp: body.created,
      live: body.livemode,
      raw: body.data?.object,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripeEvent: stripeData,
      },
    });

    return NextResponse.json({ message: "Workflow executed successfully" });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
