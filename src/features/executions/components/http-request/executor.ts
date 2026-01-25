import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  //TODO Publishing "Loading state for manual Trigger"

  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request No endpoint Configured");
  }
  if (!data.variableName) {
    throw new NonRetriableError("HTTP Request No variable name Configured");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type") || "";
    const responsData =
      contentType.includes("application/json") || contentType.includes("text/")
        ? await response.json().catch(() => response.text())
        : await response.arrayBuffer();

    const responsPayload = {
      httpRespons: {
        status: response.status,
        statusText: response.statusText,
        data: responsData,
      },
    };

    if (data.variableName) {
      return {
        ...context,
        [data.variableName!]: responsPayload,
      };
    }

    return {
      ...context,
      ...responsPayload,
    };
  });

  // const result = await step.run("http-request", async () => context);

  return result;
};
