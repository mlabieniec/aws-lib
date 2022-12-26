#!/usr/bin/env node

const { spawn } = require("child_process");
const cmd = process.argv[2];

const npm = spawn(`npm run ${cmd} --workspace=core"`);

npm.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});

npm.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

npm.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

npm.on("close", code => {
    console.log(`child process exited with code ${code}`);
});