import { getInput, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";

export const greetAction = (): void => {
  try {
    // `who_to_greet` input defined in action metadata file
    const nameToGreet = getInput("who_to_greet");
    console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
    console.log(`Process env: ${JSON.stringify(process.env, undefined, 2)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};
