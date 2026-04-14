import { BaseResolutionDetails } from "@alwaysmeticulous/api";

export const explainBaseResolutionDetails = (
  baseResolutionDetails: BaseResolutionDetails
): string => {
  switch (baseResolutionDetails.type) {
    case "suitable-test-run-already-existed":
      return (
        "A suitable base test run already existed " +
        `(${baseResolutionDetails.testRunId}), so no workflow trigger was required.`
      );
    case "waited-for-existing-workflow-run":
      return (
        "An existing base workflow run was already in progress, so we waited for it to finish " +
        `successfully (workflow ${baseResolutionDetails.workflowId}, base ${baseResolutionDetails.baseCommitSha}, ` +
        `${baseResolutionDetails.msTaken}ms).`
      );
    case "required-new-workflow-run-but-failed-due-to-new-commit-to-base-branch":
      return (
        "A new base workflow run was required, but the base branch moved to a newer commit before we could trigger it " +
        `(base ref '${baseResolutionDetails.baseRef}', target base ${baseResolutionDetails.targetBaseCommitSha}, ` +
        `current latest base ${baseResolutionDetails.currentLastestBaseCommitSha}).`
      );
    case "triggered-new-workflow-run-successfully":
      return (
        "A new base workflow run was required and was successfully triggered and completed " +
        `(workflow ${baseResolutionDetails.workflowId}, ${baseResolutionDetails.msTaken}ms).`
      );
    case "failed-for-other-reason":
      return (
        "Resolving a base workflow run failed for another reason: " +
        baseResolutionDetails.message
      );
    default: {
      const exhaustiveCheck: never = baseResolutionDetails;
      return exhaustiveCheck;
    }
  }
};
