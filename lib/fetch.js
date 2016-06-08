var http = require('http'),
    helpers = require('./helpers.js'),
    Promise = require('es6-promise').Promise;

function writeBinaryPostData(req, body) {
    //TODO implement writing file to request body
    req.end();
}

function fetch(config) {
    return new Promise((resolve, reject) => {
        var req = http.request(config, (res) => {

            var data = '';

            res.setEncoding('utf8');

            // build response
            res.on('data', (chunk) => {c
                data += chunk;
            });

            // success
            res.on('end', () => {
                var payload = {
                    headers: res.headers,
                    statusCode: res.statusCode,
                    data
                };
                resolve(payload);
            });
        });

        req.on('error', (e) => {
            reject(Error(`problem with request: ${e.message}`));
        });

        var contentType = helpers.getPropSafely(config.headers, 'Content-Type');

        if (contentType === 'application/json' ||
            contentType === 'application/x-www-form-urlencoded') {
            req.write(config.body);
            req.end();
        } else if (contentType === 'multipart/form-data') {
            writeBinaryPostData(req, config.body);
        } else {
            req.end();
        }
    });
}

module.exports = fetch;
