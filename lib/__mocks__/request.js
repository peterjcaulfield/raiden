class RequestMock {
    constructor(requestKey, config, userArgs) {
        this.requestKey = requestKey;
        this.config = config;
        this.userArgs = userArgs;
        this.url = `http://${requestKey}.com`;
    }
}

module.exports = RequestMock;
