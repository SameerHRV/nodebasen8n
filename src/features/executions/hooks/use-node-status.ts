import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import type { Realtime } from "@inngest/realtime";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { useEffect, useState } from "react";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<Realtime.Subscribe.Token>;
}

export function useNodeStatus({
  nodeId,
  channel,
  topic,
  refreshToken,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const { data } = useInngestSubscription({
    refreshToken,
    enabled: true,
  });

  useEffect(() => {
    if (!data.length) {
      return;
    }

    //Find the Latest message form this node
    const latestMessage = data
      .filter(
        (message) =>
          message.kind === "data" &&
          message.channel === channel &&
          message.topic === topic &&
          message.data.nodeId === nodeId,
      )
      .sort((a, b) => {
        if (a.kind === "data" && b.kind === "data") {
          return (
            new Date(b.data.timestamp).getTime() -
            new Date(a.data.timestamp).getTime()
          );
        }
        return 0;
      })[0];

    if (latestMessage?.kind === "data") {
      setStatus(latestMessage.data.status as NodeStatus);
    }
  }, [data, nodeId, channel, topic]);

  return status;
}
