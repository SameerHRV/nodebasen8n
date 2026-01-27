"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSuspenseExecution } from "./hooks/use-executions";
import { Collapsible } from "@/components/ui/collapsible";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";

const formateStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-4 text-green-500" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-4 text-red-500" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-4 text-blue-500 animate-spin" />;
    default:
      return <CircleIcon className="size-4 text-gray-500" />;
  }
};

export const ExecutionsView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(execution.status)}
          <div>
            <CardTitle>{formateStatus(execution.status)}</CardTitle>
            <CardDescription>
              execution for {execution.workflow.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <p className="text-sm text-muted-foreground font-medium">Workflow</p>
          <Link
            href={`/workflows/${execution.workflow.id}`}
            prefetch
            className="text-sm hover:underline text-primary"
          >
            {execution.workflow.name}
          </Link>
        </div>

        <div>
          <p className="text-sm text-muted-foreground font-medium">Status</p>
          <p>{formateStatus(execution.status)}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground font-medium">Duration</p>
          <p>
            {formatDistanceToNow(new Date(execution.startedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {execution.completedAt ? (
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Duration
            </p>
            <p>
              {formatDistanceToNow(new Date(execution.completedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        ) : null}
        {duration !== null ? (
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              Duration
            </p>
            <p>{duration}s</p>
          </div>
        ) : null}
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Inngest Event ID
          </p>
          <p>{execution.inngestEventId}</p>
        </div>

        {execution.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-red-500">Error</p>
              <p className="text-red-800 text-sm font-mono">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <Collapsible
                open={showStackTrace}
                onOpenChange={setShowStackTrace}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-100"
                  >
                    {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="text-red-800 text-xs font-mono overflow-auto mt-2 p-2 bg-red-100 rounded">
                    {execution.errorStack}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        {execution.output && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm font-medium mb-2">Output</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
