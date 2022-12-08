import { getLatestTestRunResults } from "@alwaysmeticulous/cli";
import { createClient } from "@alwaysmeticulous/cli/dist/api/client.js";
import { CodeChangeEvent } from "../types";

export const ensureBaseTestsExists = async ({
  event,
  apiToken,
  base,
}: {
  event: CodeChangeEvent;
  apiToken: string;
  base: string | null;
}): Promise<void> => {
  // Running missing tests on base is only supported for Pull Request events
  if (event.type !== "pull_request" || !base) {
    return;
  }

  const testRun = await getLatestTestRunResults({
    client: createClient({ apiToken }),
    commitSha: base,
  });

  if (testRun != null) {
    console.log(`Tests already exist for commit ${base} (${testRun.id})`);
    return;
  }

  throw new Error("TODO");
};
