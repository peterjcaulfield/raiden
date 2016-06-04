var config = require('../config').getConfig(),
    chalk = require('chalk');
//TODO pass in config as arg to exec from commmand?
module.exports = {
    exec: (program) => {
        var requestsQueue = createRequestQueue(program, config);
        console.log(requestsQueue);
    }
}

function createRequestQueue(program, config) {
    var env = config.envs[program.env] || config.envs.default;
    return program.args.reduce((queue, curr) => {
        if (!config.requests[curr]) {
            console.warn(chalk.red(`request : ${curr} not found in request.yml. Skipping.`));
            return queue;   
        };
        console.log('here');
        queue.push(createRequest(program, env, config.requests[curr]));
        return queue;
    }, []);
}


function createRequest(program, env, requestSchema) {
    var request = {};
    // url
    request.url = getUrl(env, requestSchema, program.query); 

    return request;
}
function executeRequestsAsync(requests) {}
function executeRequestsSync(requests) {}


function getUrl(e, r, q) {
    var url = `${e}/${r.endpoint}`;
    console.log(r.query);
    url = `${url}${r.query ? '?' + r.query : ''}`  
    url = `${url}${q ? (url.indexOf('?') > -1) ? '&' + q : '?' + q : ''}` 
    return url;
}
