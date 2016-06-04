var Promise = require('es6-promise').Promise,
    http = require('http');

function fetch(config) {
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
                body: JSON.parse(body)
            };
            console.log(payload);
        });
    })    

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    
    req.end();
}

module.exports = fetch;
