var config = require('../config').getConfig(),
    chalk = require('chalk');
//TODO pass in config as arg to exec from commmand?
module.exports = {
    exec: (program) => {
        var env = config.envs[program.env] || config.envs.default;
        var requestsQueue = createRequestQueue(program, config);
        console.log(requestsQueue);
    }
}

function createRequestQueue(program, config) {
    return program.args.reduce((queue, curr) => {
        if (!config.requests[curr]) {
            console.warn(chalk.red(`request : ${curr} not found in request.yml. Skipping.`));
            return queue;   
        };
        queue.push(createRequest(program, config.requests[curr]));
        return queue;
    }, []);
}


function createRequest(program, request) {
    return request;
}
function executeRequestsAsync(requests) {}
function executeRequestsSync(requests) {}

