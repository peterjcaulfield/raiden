var chalk = require('chalk');

function print(program, request, resp, data) {

    _printStatus(resp, request);

    if (program.minimal) return;

    _printHeaders(request.headers, 'request');
    _printBody(request.body, 'request');
    _printHeaders(resp.headers.raw(), 'response');
    _printBody(data, 'response');
}

function _printStatus(resp, request) {
    console.log(`[${resp.status}] ${request.url}`);
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

function _printBody(body, title) {
    console.log(chalk.white.underline(title +  ' body:'));
    console.log(body);
}

module.exports = { print }
