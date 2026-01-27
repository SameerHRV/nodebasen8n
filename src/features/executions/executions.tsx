"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LodingView,
} from "@/components/web/entity-components";
import { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { useExecutionsParams } from "./hooks/use-execution-params";
import { useSuspenseExecutions } from "./hooks/use-executions";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionsItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <>
      <EntityHeader
        title="Executions"
        description="Create and manage your executions"
      />
    </>
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <div>
      <EntityPagination
        page={executions.data.page}
        totalPages={executions.data.totalPage}
        onPageChange={(page) => setParams({ ...params, page })}
        disabled={executions.isFetching}
      />
    </div>
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsLoding = () => {
  return <LodingView message="Loading Executions...." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Failed to load executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <>
      <EmptyView message="You haven't created any executions yet." />
    </>
  );
};

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

export const ExecutionsItem = ({
  data,
}: {
  data: Execution & {
    workflow: {
      id: string;
      name: string;
    };
  };
}) => {
  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
          1000,
      )
    : null;

  const subtitle = (
    <>
      {data.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(data.startedAt, { addSuffix: true })}{" "}
      {duration !== null && <>&bull; Took {duration}s</>}
    </>
  );

  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={formateStatus(data.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
    />
  );
};
