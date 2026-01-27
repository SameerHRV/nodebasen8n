"use server";

import { geminiChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type Token = Realtime.Token<typeof geminiChannel, ["status"]>;

export async function fetchGeminiRealtimeToken(): Promise<Token> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiChannel(),
    topics: ["status"],
  });
  return token;
}
