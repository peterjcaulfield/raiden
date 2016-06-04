var http = require('http'),
    Promise = require('es6-promise').Promise;

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
            //TODO should parsing be done on the other side?
            if (res.headers['content-type'] === 'application/json') { 
                body = parseJsonResponse(body);
            }

            var payload = {
                headers: res.headers,
                statusCode: res.statusCode,
                body
            };
            console.log(payload);
        });
    })    

    req.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    
    req.end();
}

function parseJsonResponse(j) {
    var parsed = {};
    try {
        parsed = JSON.parse(j);
    } catch(e) {
        console.warn(e);    
    }
    return j;
}

module.exports = fetch;