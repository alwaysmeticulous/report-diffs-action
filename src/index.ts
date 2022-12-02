import { setFailed } from "@actions/core";
import { runMeticulousTestsAction } from "./action";
import { runCheckBaseCommitAction } from "./utils/check-base-commit";
import { getInputs } from "./utils/get-inputs";

const main = async (): Promise<void> => {
  const { command } = getInputs();

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
