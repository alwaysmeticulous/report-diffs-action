import { runPostStep } from "../../common/run-post-step";
import { getMainActionInputs } from "./get-inputs";

export const runMainActionPostStep = async (): Promise<void> => {
  const { apiToken, githubToken, testSuiteId } = getMainActionInputs();

  return runPostStep({
    apiToken,
    githubToken,
    testSuiteOrProjectId: testSuiteId,
    shouldHaveComment: true,
  });
};
