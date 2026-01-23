"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { FormValues, HttpRequestDialog } from "./dialog";

type HttpRequestNodeData = {
  endPoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const noseStatus = "initial";

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: FormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              endPoint: values.endpoint,
              method: values.method,
              body: values.body,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const discription = nodeData.endPoint
    ? `${nodeData.method || "GET"} ${nodeData.endPoint}`
    : "Not Configured";

  return (
    <>
      <HttpRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultEndpoint={nodeData.endPoint}
        defaultMethod={nodeData.method}
        defaultBody={nodeData.body}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        status={noseStatus}
        icon={GlobeIcon}
        label="HTTP Request"
        description={discription}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HttpRequestNode.displayName = "HttpRequestNode";
