import { getInput, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";

export const greetAction = (): void => {
  try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = getInput("who-to-greet");
    console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};
