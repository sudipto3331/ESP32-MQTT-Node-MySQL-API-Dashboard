//This section is to start the API Server and MQTT Listener Server at the same time
const { exec } = require('child_process');

function runFile(fileName) {
    const child = exec(`node ${fileName}`);

    child.stdout.on('data', (data) => {
        console.log(`${fileName} : ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`${fileName} error: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`${fileName} child process exited with code ${code}`);
    });
}

// Run api.js
runFile('api.js');

// Run mqtt-listener.js
runFile('mqtt-listener.js');
