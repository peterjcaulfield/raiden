var http = require('http'),
    Promise = require('es6-promise').Promise;

function writeBinaryPostData(req, body) {
    //TODO implement writing file to request body
    req.end();
}

function fetch(config) {
    
    return new Promise((resolve, reject) => {

        var req = http.request(config, (res) => {

            var body = '';

            res.setEncoding('utf8');

            // build response
            res.on('data', (chunk) => {
                body += chunk;
            });

            // success
            res.on('end', () => {
                var payload = {
                    headers: res.headers,
                    statusCode: res.statusCode,
                    body
                };
                resolve(payload);
            });
        });    

        req.on('error', (e) => {
            reject(Error(`problem with request: ${e.message}`));
        });

        if (config.headers['Content-Type'] === 'application/json' ||
            config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            req.write(config.body);
            req.end();
        } else if (config.headers['Content-Type'] === 'multipart/form-data') {
            writeBinaryPostData(req, config.body);
        } else {
            req.end();
        }
    });
}

module.exports = fetch;
