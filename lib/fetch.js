var http = require('http'),
    Promise = require('es6-promise').Promise;

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
        
        req.end();
    });
}

module.exports = fetch;
