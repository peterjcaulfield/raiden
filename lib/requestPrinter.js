function print(program, request, resp) {

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

    const execTime = request.getExecutionTime(),
          pad =  ' '.repeat(9 - execTime.length);

    const status = execTime +
        `${min ? pad : ' '}[${resp.statusCode}]` +
        ` ${resp.request.method}` +
        ` ${resp.request.href}`;

    console.log(status);
}

function _printHeaders(headers, title) {

    console.log(`${title === 'request' ? '=>' : '<='} ${title} headers:`);

    headers = Object.keys(headers).reduce((formatted, key) => {
        formatted[key] = headers[key] instanceof Array ? headers[key].join('; ') :
            headers[key];
        return formatted;
    }, {});

    console.log(headers);
}

function _printBody(resp, title) {

    if (title === 'request') {

        if (resp.request.method !== 'HEAD') {

            console.log(`=> ${title} body:`);

            _printRequestBody(resp);
        }

    } else {

        console.log(`<= ${title} body:`);

        _printResponseBody(resp);
    }
}

function _printResponseBody(resp) {

    if (resp.headers['content-type'].indexOf('application/json') !== -1) {

        // if json: true is ommited in the request definition we need to
        // to do the decoding ourselves
        if (typeof resp.body === 'string') {
            console.log(JSON.parse(resp.body));
        } else {
            console.log(resp.body);
        }

    } else {
        console.log(resp.body);
    }

}

function _printRequestBody(resp) {

    if (!resp.request.headers['content-type']) return;

    if (resp.request.headers['content-type'].indexOf('multipart/form-data') !== -1) {
        console.log(resp.request.formData);
    } else if (resp.request.headers['content-type'].indexOf('application/x-www-form-urlencoded') !== -1) {
        console.log(resp.request.body);
    } else if (resp.request.headers['content-type'].indexOf('application/json') !== -1) {
        console.log(JSON.parse(resp.request.body));
    } else {
        console.log(resp.request.body);
    }

}

module.exports = { print };
