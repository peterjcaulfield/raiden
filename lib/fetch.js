var http = require('http'),
    helpers = require('./helpers.js'),
    Promise = require('es6-promise').Promise;

function writeBinaryPostData(req, filepath) {

    var fs = require('fs'),
        data = fs.readFileSync(filepath);

    var crlf = "\r\n",
        boundaryKey = Math.random().toString(16),
        boundary = `--${boundaryKey}`,
        delimeter = `${crlf}--${boundary}`,
        headers = [
          `Content-Disposition: form-data; name="upload"; filename=\"${filepath.split("/").pop()}\" ${crlf}`
        ],
        closeDelimeter = `${delimeter}--`,
        multipartBody;


    multipartBody = Buffer.concat([
        new Buffer(delimeter + crlf + headers.join('') + crlf),
        data,
        new Buffer(closeDelimeter)]
    );

    req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
    req.setHeader('Content-Length', multipartBody.length);

    req.write(multipartBody);
    req.end();
}

function fetch(config) {
    return new Promise((resolve, reject) => {
        var req = http.request(config, (res) => {

            var data = '';

            res.setEncoding('utf8');

            // build response
            res.on('data', (chunk) => {
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
        } else if (contentType === 'multipart/form-data' || helpers.isFilePath(config.body)) {
            writeBinaryPostData(req, config.body);
        } else {
            req.end();
        }
    });
}

module.exports = fetch;
