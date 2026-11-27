import { API_URL } from "./changes";

export type RepositoryBranchesResponse = {
  repository_name: string;
  branches: string[];
};

function isRepositoryBranchesResponse(value: unknown): value is RepositoryBranchesResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "repository_name" in value &&
    typeof value.repository_name === "string" &&
    "branches" in value &&
    Array.isArray(value.branches) &&
    value.branches.every((branch) => typeof branch === "string")
  );
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = payload.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (typeof detail === "object" && detail !== null && "message" in detail) {
      const message = detail.message;
      if (typeof message === "string") {
        return message;
      }
    }
  }
  return `Could not validate the repository (HTTP ${status}).`;
}

export async function fetchRepositoryBranches(repositoryUrl: string): Promise<RepositoryBranchesResponse> {
  const query = new URLSearchParams({ repository_url: repositoryUrl });
  const response = await fetch(`${API_URL}/github/branches?${query.toString()}`);
  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }
  if (!isRepositoryBranchesResponse(payload)) {
    throw new Error("The branch lookup returned an invalid response.");
  }

  return payload;
}
