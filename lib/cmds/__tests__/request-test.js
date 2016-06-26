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
        tough,
        CookieFilestore,
        Promise;

    beforeEach(() => {

        config = require('../../config'),
        rp = require('request-promise'),
        Promise = require('bluebird'),
        Request = require('../../request'),
        RequestPrinter = require('../../requestPrinter'),
        tough = require('tough-cookie'),
        CookieFilestore = require('../../cookieFilestore'),
        RequestCommand = require('../request');

    });

    it('RequestCommand processes queue synchronously with --sync flag', (done) => {

        const program = { env: 'foo', args: ['foo', 'bar'], sync: true };

        rp.mockReturnValue(Promise.resolve());

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(rp.mock.calls[0][0]).toEqual('foo request config');
            expect(rp.mock.calls[1][0]).toEqual('bar request config');

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
            expect(rp.mock.calls[0][0]).toEqual('foo request config');
            expect(rp.mock.calls[1][0]).toEqual('bar request config');
            expect(rp.mock.calls[2][0]).toEqual('baz request config');

            // assert that async processing was done in reverse order
            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('baz');
            expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');
            expect(RequestPrinter.print.mock.calls[2][1].requestKey).toEqual('foo');

            // let jasmine know we are done
            done();
        });

    });

    //it('RequestCommand stores a response cookie in cookie jar', () => {

        //jest.useFakeTimers();

        //const program = { env: 'bar', args: ['foo'], sync: true };

        //let rpReturn = {
            //headers: {
                //get: (header) => {
                    //return 'set-cookie: foo=bar';
                //}
            //},
            //text: () => {
                //return Promise.resolve();
            //}
        //};

        //rp.mockReturnValue(Promise.resolve(rpReturn));

        //const cookieStub = { foo: 'bar' };

        //tough.Cookie.parse.mockReturnValue(cookieStub);

        //requestCommand = new RequestCommand(program);

        //requestCommand.exec();

        //// resolve all the promises
        //jest.runAllTimers();

        //expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[0][0]).toEqual(cookieStub);
        //expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls.length).toEqual(1);

    //});

    //it('RequestCommand stores multiple response cookies in cookie jar', () => {

        //jest.useFakeTimers();

        //const program = { env: 'bar', args: ['foo'], sync: true };

        //let rpReturn = {
            //headers: {
                //get: (header) => {
                    //return ['set-cookie: foo=bar', 'set-cookie: baz=qux'];
                //}
            //},
            //text: () => {
                //return Promise.resolve();
            //}
        //};

        //rp.mockReturnValue(Promise.resolve(rpReturn));

        //const cookieStubs = [{ foo: 'bar' }, { baz: 'qux' }];

        //tough.Cookie.parse.mockReturnValueOnce(cookieStubs[0]);
        //tough.Cookie.parse.mockReturnValueOnce(cookieStubs[1]);

        //requestCommand = new RequestCommand(program);

        //requestCommand.exec();

        //// resolve all the promises
        //jest.runAllTimers();

        //expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[0][0]).toEqual(cookieStubs[0]);
        //expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls[1][0]).toEqual(cookieStubs[1]);
        //expect(tough.CookieJar.mock.instances[0].setCookie.mock.calls.length).toEqual(2);

    //});

});
