import { runPostStep } from "../../common/run-post-step";
import { getInCloudActionInputs } from "./get-inputs";

export const runCloudComputePostStep = async (): Promise<void> => {
  const { projectTargets, githubToken } = getInCloudActionInputs();

  const projectTargetsToRun = projectTargets.filter((target) => !target.skip);

  await Promise.all(
    projectTargetsToRun.map((target) =>
      runPostStep({ apiToken: target.apiToken, githubToken })
    )
  );
};
