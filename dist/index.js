var $cDXzb$actionscore = require("@actions/core");
var $cDXzb$actionsgithub = require("@actions/github");



const $4651b5e8cb35dfd4$export$7dd09c0cc767ba74 = ()=>{
    try {
        // `who-to-greet` input defined in action metadata file
        const nameToGreet = (0, $cDXzb$actionscore.getInput)("who-to-greet");
        console.log(`Hello ${nameToGreet}!`);
        const time = new Date().toTimeString();
        (0, $cDXzb$actionscore.setOutput)("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify((0, $cDXzb$actionsgithub.context).payload, undefined, 2);
        console.log(`The event payload: ${payload}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        (0, $cDXzb$actionscore.setFailed)(message);
    }
};


(0, $4651b5e8cb35dfd4$export$7dd09c0cc767ba74)();


//# sourceMappingURL=index.js.map
