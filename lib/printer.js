function print(program, resp, data) {
    var raw = {};

    raw.headers = resp.headers.raw();
    raw.statusCode = resp.status;
    raw.body = data;

    console.log(JSON.stringify(raw, null, 2));
}

module.exports = { print }
