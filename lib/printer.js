var chalk = require('chalk'),
    FormData = require('form-data');

function printRequestInfo(program, request, resp, data) {

    if (program.info) return;

    _printStatus(request, resp, request);

    if (program.minimal) return;

    if (program.headers) {
        _printHeaders(request.config.headers, 'request');
        _printHeaders(resp.headers.raw(), 'response');
    } else if (program.body) {
        _printRequestBody(request);
        if (request.config.method !== 'HEAD') {
          _printResponseBody(data);
        }
    } else {
        _printHeaders(request.config.headers, 'request');
        _printRequestBody(request);
        _printHeaders(resp.headers.raw(), 'response');
        if (request.config.method !== 'HEAD') {
          _printResponseBody(data);
        }
    }
}

function _printStatus(request, resp, request) {
    console.log(`${request.getExecutionTime()} [${resp.status}] ${request.config.method} ${request.url}`);
}

function _printHeaders(headers, title) {
    console.log(chalk.white.underline(title +  ' headers:'));
    headers = Object.keys(headers).reduce((formatted, key) => {
        formatted[key] = headers[key] instanceof Array ? headers[key].join('; ') :
            headers[key];
        return formatted;
    }, {})
    console.log(JSON.stringify(headers, null, 2));
}

function _printRequestBody(request) {
    console.log(chalk.white.underline('request body:'));
    if (request.config.body instanceof FormData) {
      console.log(request.rawConfig.body);
    } else {
      console.log(request.config.body);
    }
}

function _printResponseBody(body) {
    console.log(chalk.white.underline('response body:'));
    console.log(body);
}

module.exports = { printRequestInfo }
