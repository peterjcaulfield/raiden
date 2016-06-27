const chalk = require('chalk'),
    FormData = require('form-data');

function print(program, request, resp) {

    if (program.info) return;

    _printStatus(request, resp, program.minimal);

    if (program.minimal) return;

    if (program.headers) {

        _printHeaders(resp.request.headers, 'request');
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

function _printStatus(request, resp, min) {

    const status = request.getExecutionTime() +
        ` [${resp.statusCode}]` +
        ` ${resp.request.method}` +
        ` ${resp.request.href}`

    console.log(status); 
}

function _printHeaders(headers, title) {

    console.log(`${title === 'request' ? '=>' : '<='} ${title} headers:`);

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

            console.log(`=> ${title} body:`);

            if (resp.request.headers['content-type'] &&
                resp.request.headers['content-type'].indexOf('multipart/form-data') != -1) {
                
                console.log(resp.request.formData);

            } else {
                console.log(resp.request.body || ''); 
            }
        }

    } else {
        console.log(`<= ${title} body:`);
        console.log(resp.body);
    }
}

module.exports = { print }
