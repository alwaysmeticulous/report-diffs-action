import { createDefaultDependencies } from "../../testing/services";
import { MainAction } from "./main-action";

export const runMeticulousTestsAction = async (): Promise<void> => {
  const dependencies = createDefaultDependencies();
  const action = new MainAction(dependencies);
  
  const exitCode = await action.run();
  
  await dependencies.sentry.close(5_000);
  process.exit(exitCode);
};
