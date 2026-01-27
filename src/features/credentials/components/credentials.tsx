"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LodingView,
} from "@/components/web/entity-components";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";
import type { Credential } from "@/generated/prisma/client";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage your credentials"
        disabled={disabled}
        newButtonHref="/credentials/new"
        newButtonLable="New Credential"
      />
    </>
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <div>
      <EntityPagination
        page={credentials.data.page}
        totalPages={credentials.data.totalPage}
        onPageChange={(page) => setParams({ ...params, page })}
        disabled={credentials.isFetching}
      />
    </div>
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader disabled={false} />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsLoding = () => {
  return <LodingView message="Loading Credentials...." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Failed to load credentials" />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <>
      <EmptyView
        message="You haven't created any credentials yet. Get started by creating your first credential."
        noNew={handleCreate}
      />
    </>
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.ANTHROPIC]: "/anthropic.svg",
  [CredentialType.GEMINI]: "/gemini.svg",
  [CredentialType.OPENAI]: "/openai.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo = credentialLogos[data.type] || "/gemini.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
