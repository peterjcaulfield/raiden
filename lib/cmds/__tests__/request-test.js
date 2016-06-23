'use strict';

jest.unmock('../request');
jest.unmock('chalk');
jest.unmock('es6-promise');

describe('lib/cmd/request', () => {

    let RequestCommand,
        requestCommand,
        //all Request deps
        config,
        fetch,
        RequestPrinter,
        Request,
        tough,
        CookieFilestore,
        Promise;

    beforeEach(() => {

        config = require('../../config'),
        fetch = require('node-fetch'),
        Request = require('../../request'),
        RequestPrinter = require('../../requestPrinter'),
        tough = require('tough-cookie'),
        CookieFilestore = require('../../cookieFilestore'),
        Promise = require('es6-promise').Promise,
        RequestCommand = require('../request');

    });

    it('RequestCommand processes queue synchronously with --sync flag', () => {

        const program = { env: 'foo', args: ['foo', 'bar'], sync: true };

        const fetchReturn = {
            headers: {
                get: () => {
                    return false;
                }
            },
            text: () => {
                return Promise.resolve();
            }
        };

        fetch.mockReturnValue(Promise.resolve(fetchReturn));

        requestCommand = new RequestCommand(program).exec();

        // resolve all the promises
        jest.runAllTimers();

        expect(fetch.mock.calls[0][0]).toEqual('http://foo.com');
        expect(fetch.mock.calls[0][1]).toEqual('foo request config');
        expect(fetch.mock.calls[1][0]).toEqual('http://bar.com');
        expect(fetch.mock.calls[1][1]).toEqual('bar request config');

        expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('foo');
        expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');
    });

    it('RequestCommand processes queue asynchronously with --async flag', (done) => {

        // we actually want to test async processing so let's use real timers
        jest.useRealTimers();

        const program = { env: 'foo', args: ['foo', 'bar', 'baz'], async: true };

        let fetchReturn = {
            headers: {
                get: () => {
                    return false;
                }
            },
            text: () => {
                return Promise.resolve();
            }
        };

        const getDelayedPromise = function(delay) {

            const promise = new Promise((resolve) => {
                setTimeout(() => { resolve(fetchReturn); }, delay);
            });

            return promise;
        };

        // make earlier items in queue take longer to complete
        // which should make queue items finish processing in
        // reverse order
        fetch.mockReturnValueOnce(getDelayedPromise(100));
        fetch.mockReturnValueOnce(getDelayedPromise(50));
        fetch.mockReturnValueOnce(Promise.resolve(fetchReturn));

        requestCommand = new RequestCommand(program).exec().then(() => {

            // assert queue async operations kicked off in order
            expect(fetch.mock.calls[0][0]).toEqual('http://foo.com');
            expect(fetch.mock.calls[0][1]).toEqual('foo request config');
            expect(fetch.mock.calls[1][0]).toEqual('http://bar.com');
            expect(fetch.mock.calls[1][1]).toEqual('bar request config');
            expect(fetch.mock.calls[2][0]).toEqual('http://baz.com');
            expect(fetch.mock.calls[2][1]).toEqual('baz request config');

            // assert that async processing was done in reverse order
            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('baz');
            expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');
            expect(RequestPrinter.print.mock.calls[2][1].requestKey).toEqual('foo');

            // let jasmine know we are done
            done();
        });

    });

    it('RequestCommand stores a response cookie in cookie jar', () => {

        jest.useFakeTimers();

        const program = { env: 'bar', args: ['foo'], sync: true };

        let fetchReturn = {
            headers: {
                get: (header) => {
                    return 'set-cookie: foo=bar';
                }
            },
            text: () => {
                return Promise.resolve();
            }
        };

        fetch.mockReturnValue(Promise.resolve(fetchReturn));

        const cookieStub = { foo: 'bar' };

        tough.Cookie.parse.mockReturnValue(cookieStub);

        requestCommand = new RequestCommand(program);

        requestCommand.exec();

        // resolve all the promises
        jest.runAllTimers();

        expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[0][0]).toEqual(cookieStub);
        expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls.length).toEqual(1);

    });

    it('RequestCommand stores multiple response cookies in cookie jar', () => {

        jest.useFakeTimers();

        const program = { env: 'bar', args: ['foo'], sync: true };

        let fetchReturn = {
            headers: {
                get: (header) => {
                    return ['set-cookie: foo=bar', 'set-cookie: baz=qux'];
                }
            },
            text: () => {
                return Promise.resolve();
            }
        };

        fetch.mockReturnValue(Promise.resolve(fetchReturn));

        const cookieStubs = [{ foo: 'bar' }, { baz: 'qux' }];

        tough.Cookie.parse.mockReturnValueOnce(cookieStubs[0]);
        tough.Cookie.parse.mockReturnValueOnce(cookieStubs[1]);

        requestCommand = new RequestCommand(program);

        requestCommand.exec();

        // resolve all the promises
        jest.runAllTimers();

        expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[0][0]).toEqual(cookieStubs[0]);
        expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[1][0]).toEqual(cookieStubs[1]);
        expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls.length).toEqual(2);

    });

});
