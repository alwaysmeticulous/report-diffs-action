import { setFailed } from "@actions/core";
import { runMeticulousTestsAction } from "./action";
import { runCheckBaseCommitAction } from "./utils/check-base-commit";
import { getInputFromEnv } from "./utils/get-input-from-env";

const main = async (): Promise<void> => {
  const command = getInputFromEnv({
    name: "command",
    required: true,
    type: "string",
  });

  if (command === "check-base-commit") {
    await runCheckBaseCommitAction();
    return;
  }

  await runMeticulousTestsAction();
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : `${error}`;
  setFailed(message);
  process.exit(1);
});
