var chalk = require('chalk'),
    FormData = require('form-data');

function print(program, request, resp) {

    if (program.info) return;

    _printStatus(request, resp, request);

    if (program.minimal) return;

    if (program.headers) {

        _printHeaders(resp.request.heaaders, 'request');
        _printHeaders(resp.headers, 'response');

    } else if (program.body) {

        _printBody(resp, 'request');
        _printBody(resp, 'response');

    } else {

        _printHeaders(resp.request.headers, 'request');
        _printBody(resp, 'request');
        _printHeaders(resp.headers, 'response');
        _printBody(resp, 'response');
    }
}

function _printStatus(request, resp) {
    console.log(
        request.getExecutionTime() +
        ` [${resp.statusCode}]` +
        ` ${resp.request.method}` +
        ` ${resp.request.href}`
    );
}

function _printHeaders(headers, title) {

    console.log(chalk.white.underline(title +  ' headers:'));

    headers = Object.keys(headers).reduce((formatted, key) => {
        formatted[key] = headers[key] instanceof Array ? headers[key].join('; ') :
            headers[key];
        return formatted;
    }, {});

    console.log(JSON.stringify(headers, null, 2));
}

function _printBody(resp, title) {

    if (title === 'request') {

        if (resp.request.method !== 'HEAD') {

            console.log(chalk.white.underline(`${title} body:`));

            if (resp.request.headers['content-type'] &&
                resp.request.headers['content-type'].indexOf('multipart/form-data') != -1) {
                
                console.log(resp.request.formData);

            } else {
                console.log(resp.request.body || ''); 
            }
        }

    } else {
        console.log(chalk.white.underline(`${title} body:`));
        console.log(resp.body);
    }
}

module.exports = { print }
