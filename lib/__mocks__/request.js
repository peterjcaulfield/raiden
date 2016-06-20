class RequestMock {
    constructor(requestKey, config, userArgs) {
        this.requestKey = requestKey;
        this.config = config;
        this.userArgs = userArgs;
        this.url = 'http://foo.com';
    }
}

module.exports = RequestMock;
