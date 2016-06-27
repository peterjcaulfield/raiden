'use strict';

jest.unmock('../request');
jest.unmock('chalk');
jest.unmock('bluebird');

describe('lib/cmd/request', () => {

    let RequestCommand,
        requestCommand,

        //all Request deps
        config,
        rp,
        RequestPrinter,
        Request,
        CookieFilestore,
        Promise;

    beforeEach(() => {

        config = require('../../config'),
        rp = require('request-promise'),
        Promise = require('bluebird'),
        Request = require('../../request'),
        RequestPrinter = require('../../requestPrinter'),
        CookieFilestore = require('../../cookieFilestore'),
        RequestCommand = require('../request');

    });

    it('RequestCommand processes queue synchronously with --sync flag', (done) => {

        const program = { env: 'foo', args: ['foo', 'bar'], sync: true };

        rp.jar = () => { return {} };

        rp.mockReturnValue(Promise.resolve());

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(rp.mock.calls[0][0]).toEqual(Object.assign({ jar: {} }, config.requests.foo));
            expect(rp.mock.calls[1][0]).toEqual(Object.assign({ jar: {} }, config.requests.bar));

            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('foo');
            expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');

            done();
            
        });

        // resolve all the promises
        jest.runAllTimers();

    });

    it('RequestCommand processes queue asynchronously with --async flag', (done) => {

        // we actually want to test async processing so let's use real timers
        jest.useRealTimers();

        const program = { env: 'foo', args: ['foo', 'bar', 'baz'], async: true };

        rp.jar = () => { return {} };

        const getDelayedPromise = function(delay) {

            const promise = new Promise((resolve) => {
                setTimeout(() => { resolve(); }, delay);
            });

            return promise;
        };

        // make earlier items in queue take longer to complete
        // which should make queue items finish processing in
        // reverse order
        rp.mockReturnValueOnce(getDelayedPromise(100));
        rp.mockReturnValueOnce(getDelayedPromise(50));
        rp.mockReturnValueOnce(Promise.resolve());

        requestCommand = new RequestCommand(program).exec().then(() => {

            // assert queue async operations kicked off in order
            expect(rp.mock.calls[0][0]).toEqual(Object.assign({ jar: {} }, config.requests.foo));
            expect(rp.mock.calls[1][0]).toEqual(Object.assign({ jar: {} }, config.requests.bar));
            expect(rp.mock.calls[2][0]).toEqual(Object.assign({ jar: {} }, config.requests.baz));

            // assert that async processing was done in reverse order
            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('baz');
            expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');
            expect(RequestPrinter.print.mock.calls[2][1].requestKey).toEqual('foo');

            // let jasmine know we are done
            done();
        });

    });

});
