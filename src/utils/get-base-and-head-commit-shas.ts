import { exec } from "child_process";
import { CodeChangeEvent } from "../types";
interface BaseAndHeadCommitShas {
  base: string;
  head: string;
}

export const getBaseAndHeadCommitShas = async (
  event: CodeChangeEvent
): Promise<BaseAndHeadCommitShas> => {
  if (event.type === "pull_request") {
    return {
      base: event.payload.pull_request.base.sha,
      head: event.payload.pull_request.head.sha,
    };
  }
  if (event.type === "push") {
    return { base: event.payload.before, head: event.payload.after };
  }
  if (event.type === "workflow_dispatch") {
    const headRef = getWorkflowInput(event.payload.inputs["head-commit-sha"]);
    const head = await execGitRevParse(headRef ?? "HEAD");
    const baseRef = getWorkflowInput(event.payload.inputs["base-commit-sha"]);
    const base = await execGitRevParse(baseRef ?? `${head}~1`);
    return {
      base,
      head,
    };
  }
  return assertNever(event);
};

const getWorkflowInput = (value: unknown): string | null => {
  if (typeof value === "string" && value) {
    return value;
  }
  return null;
};

const execGitRevParse = async (ref: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`git rev-parse ${ref}`, { encoding: "utf-8" }, (error, output) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(output.trim());
    });
  });
};

const assertNever = (event: never): never => {
  throw new Error("Unexpected event: " + JSON.stringify(event));
};
