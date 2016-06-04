var config = require('../config').getConfig();
//TODO pass in config as arg to exec from commmand?
module.exports = {
    exec: (program) => {
        var env = config.envs[program.env] || config.envs.default;
        var requestsQueue = createRequestQueue(program, config);
    }
}

function createRequestQueue(program, config) {
    return program.args.reduce((queue, curr) => {
        if (!config[curr]) {
            console.warn(chalk.red(`request : ${request} not found in request.yml. Skipping.`));
            return queue;   
        };
        queue.push(createRequest(program, request));
        return queue;
    }, []);
}


function createRequest(program, request) {}
function executeRequestsAsync(requests) {}
function executeRequestsSync(requests) {}

