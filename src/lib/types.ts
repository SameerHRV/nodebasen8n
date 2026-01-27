export type CredentialType = "GEMINI" | "OPENAI" | "ANTHROPIC";

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
