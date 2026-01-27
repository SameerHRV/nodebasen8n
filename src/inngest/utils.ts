import toposort from "toposort";
import { Node, Connection } from "../generated/prisma/client";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

export const TopologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  if (connections.length === 0) return nodes;
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  const connctionNodeIds = new Set<string>();
  for (const conn of connections) {
    connctionNodeIds.add(conn.fromNodeId);
    connctionNodeIds.add(conn.toNodeId);
  }

  for (const node of nodes) {
    if (!connctionNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  let sortedNodes: string[];

  try {
    sortedNodes = toposort(edges);

    sortedNodes = [...new Set(sortedNodes)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Cyclic dependency detected");
    }
    throw error;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return sortedNodes.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  await inngest.send({
    name: "workflow/execute.workflow",
    data,
    id: createId(),
  });
};
