import {getInput as $6B8p2$getInput, setOutput as $6B8p2$setOutput, setFailed as $6B8p2$setFailed} from "@actions/core";
import {context as $6B8p2$context} from "@actions/github";



const $73105851ee1dace6$export$7dd09c0cc767ba74 = ()=>{
    try {
        // `who-to-greet` input defined in action metadata file
        const nameToGreet = (0, $6B8p2$getInput)("who-to-greet");
        console.log(`Hello ${nameToGreet}!`);
        const time = new Date().toTimeString();
        (0, $6B8p2$setOutput)("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify((0, $6B8p2$context).payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        (0, $6B8p2$setFailed)(message);
    }
};


(0, $73105851ee1dace6$export$7dd09c0cc767ba74)();


//# sourceMappingURL=module.mjs.map
