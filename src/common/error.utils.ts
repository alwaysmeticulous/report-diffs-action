import { DOCS_URL } from "./constants";

export const isGithubPermissionsError = (
  error: MaybeOctokitRequestError | unknown
): boolean => {
  const message = getErrorMessage(error);
  return (
    message.toLowerCase().includes("resource not accessible by integration") ||
    (error as MaybeOctokitRequestError)?.status === 403
  );
};

export const getErrorMessage = (error: unknown) => {
  const message = (error as MaybeOctokitRequestError)?.message ?? "";
  return typeof message === "string" ? message : "";
};

// Octokit returns RequestErrors, which have a message and a code
// But we can't make any strong assumptions, so we type it on the safe side
// https://github.com/octokit/request-error.js/blob/372097e9b16f70d4ad75089003dc9154e304faa7/src/index.ts#L16
type MaybeOctokitRequestError =
  | {
      message?: string | unknown;
      status?: number | unknown;
      response?: {
        url?: string;
        headers?: {
          "x-accepted-github-permissions"?: string;
        };
      };
    }
  | null
  | undefined;

export const DEFAULT_FAILED_OCTOKIT_REQUEST_MESSAGE = `Please check www.githubstatus.com, and that you have setup the action correctly, including with the correct permissions: see ${DOCS_URL} for the correct setup.`;

export type GitHubPermissionsErrorContext = {
  operation: "get_workflow_run" | "trigger_workflow" | "get_branch" | "comment";
  apiEndpoint?: string;
  requiredPermissions?: string[];
};

export type RequiredPermission =
  | "actions: read"
  | "actions: write"
  | "contents: read"
  | "pull-requests: write"
  | "issues: write"
  | "statuses: read";

export const ALL_REQUIRED_PERMISSIONS: RequiredPermission[] = [
  "actions: write",
  "contents: read",
  "issues: write",
  "pull-requests: write",
  "statuses: read",
];

export const OPERATION_PERMISSIONS: Record<
  GitHubPermissionsErrorContext["operation"],
  RequiredPermission[]
> = {
  get_workflow_run: ["actions: read"],
  trigger_workflow: ["actions: write"],
  get_branch: ["contents: read"],
  comment: ["pull-requests: write"],
};

export const getDetailedGitHubPermissionsError = (
  error: MaybeOctokitRequestError | unknown,
  context: GitHubPermissionsErrorContext
): string => {
  if (!isGithubPermissionsError(error)) {
    return getErrorMessage(error);
  }

  const acceptedPermissions = (error as MaybeOctokitRequestError)?.response
    ?.headers?.["x-accepted-github-permissions"];
  const apiUrl = (error as MaybeOctokitRequestError)?.response?.url;

  let message =
    "GitHub API Error: Resource not accessible by integration (403)\n\n";

  // Add specific context based on the operation
  switch (context.operation) {
    case "get_workflow_run":
      message += "Failed to retrieve workflow run information.\n";
      message += "This typically happens when:\n";
      message +=
        "1. The GitHub token doesn't have 'actions: read' permission\n";
      message += "2. The workflow is private and the token lacks access\n";
      break;
    case "trigger_workflow":
      message += "Failed to trigger workflow on base branch.\n";
      message += "This typically happens when:\n";
      message +=
        "1. The GitHub token doesn't have 'actions: write' permission\n";
      message +=
        "2. The workflow doesn't have 'workflow_dispatch' trigger enabled\n";
      message += "3. The branch protection rules prevent workflow dispatch\n";
      break;
    case "get_branch":
      message += "Failed to get branch information.\n";
      message += "This typically happens when:\n";
      message +=
        "1. The GitHub token doesn't have 'contents: read' permission\n";
      message +=
        "2. The branch is protected and requires additional permissions\n";
      break;
    case "comment":
      message += "Failed to create or update PR comment.\n";
      message += "This typically happens when:\n";
      message +=
        "1. The GitHub token doesn't have 'pull-requests: write' permission\n";
      message += "2. The repository has disabled PR comments\n";
      break;
  }

  message += "\n**To fix this issue:**\n\n";
  message += getCommonPermissionsErrorMessage();

  // Add workflow_dispatch requirement if needed
  if (context.operation === "trigger_workflow") {
    message +=
      "Also ensure your workflow has the 'workflow_dispatch' trigger:\n\n";
    message += "```yaml\n";
    message += "on:\n";
    message += "  pull_request: {}\n";
    message += "  push:\n";
    message += "    branches: [main, master]\n";
    message += "  workflow_dispatch: {}\n";
    message += "```\n\n";
  }

  // Add debugging information
  if (apiUrl) {
    message += `API endpoint that failed: ${apiUrl}\n`;
  }
  if (acceptedPermissions) {
    message += `Required GitHub permissions: ${acceptedPermissions}\n`;
  }

  return message;
};

export const getCommonPermissionsErrorMessage = (): string => {
  const permissionLines = ALL_REQUIRED_PERMISSIONS.map(
    (perm) => `  ${perm}`
  ).join("\n");

  return `
If you're seeing this error, it's likely because your GitHub workflow is missing required permissions.

**Most common fix - Add ALL these permissions to your workflow:**

\`\`\`yaml
permissions:
${permissionLines}
\`\`\`


**Also ensure your workflow has the workflow_dispatch trigger:**

\`\`\`yaml
on:
  pull_request: {}
  push:
    branches: [main, master]
  workflow_dispatch: {}  # This line is required!
\`\`\`

**If you're still having issues, check:**
1. Your repository permissions allow the GitHub token to access actions
2. Branch protection rules aren't blocking workflow dispatch
3. The Meticulous GitHub app is properly connected to your repository

For complete setup instructions, see: ${DOCS_URL}
  `.trim();
};

export const createPermissionsValidationError = (
  operation: GitHubPermissionsErrorContext["operation"],
  additionalContext?: string
): Error => {
  const contextMessage = additionalContext ? `\n\n${additionalContext}` : "";

  const message = `GitHub API Error: Missing required permissions for ${operation}${contextMessage}`;

  const error = new Error(message);
  // Mark this as a permissions error so getDetailedGitHubPermissionsError can handle it
  (error as any).status = 403;
  return error;
};
