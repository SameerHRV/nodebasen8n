"use server";

import { discordChannel } from "@/inngest/channels/discord";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type Token = Realtime.Token<typeof discordChannel, ["status"]>;

export async function fetchdiscordRealtimeToken(): Promise<Token> {
  const token = await getSubscriptionToken(inngest, {
    channel: discordChannel(),
    topics: ["status"],
  });
  return token;
}
