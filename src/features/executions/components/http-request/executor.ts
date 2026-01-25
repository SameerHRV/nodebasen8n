import { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

type HttpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  //TODO Publishing "Loading state for manual Trigger"

  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request: No endpoint Configured");
  }

  if (!data.variableName) {
    throw new NonRetriableError("HTTP Request: No variable name Configured");
  }

  if (!data.method) {
    throw new NonRetriableError("HTTP Request: No method Configured");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endpoint)(context);
    const method = data.method;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolve = Handlebars.compile(data.body || "{}");
      const parsedBody = JSON.parse(resolve(context));
      options.body = parsedBody;
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

    return {
      ...context,
      [data.variableName]: responsPayload,
    };
  });

  return result;
};
