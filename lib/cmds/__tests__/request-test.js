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

        config = require('../../userConfigs'),
        rp = require('request-promise'),
        Promise = require('bluebird'),
        Request = require('../../request'),
        RequestPrinter = require('../../requestPrinter'),
        CookieFilestore = require('../../cookieFilestore'),
        RequestCommand = require('../request');
        jest.useFakeTimers();

    });

    it('RequestCommand processes queue synchronously with --sync flag', (done) => {

        const program = { env: 'foo', args: ['foo', 'bar'], sync: true };

        rp.jar = () => { return {} };

        rp.mockReturnValue(Promise.resolve());

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(rp.mock.calls[0][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('foo')));
            expect(rp.mock.calls[1][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('bar')));

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
            expect(rp.mock.calls[0][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('foo')));
            expect(rp.mock.calls[1][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('bar')));
            expect(rp.mock.calls[2][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('baz')));

            // assert that async processing was done in reverse order
            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('baz');
            expect(RequestPrinter.print.mock.calls[1][1].requestKey).toEqual('bar');
            expect(RequestPrinter.print.mock.calls[2][1].requestKey).toEqual('foo');

            // let jasmine know we are done
            done();
        });

    });

    it('RequestCommand skips invalid requests', (done) => {

        const program = { env: 'foo', args: ['invalid', 'bar'], sync: true };

        // supress the error output
        console.error = () => {};

        rp.jar = () => { return {} };
        
        rp.mockReturnValue(Promise.resolve());

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(rp.mock.calls[0][0]).toEqual(Object.assign({ jar: {} }, config.requests.get('bar')));
            expect(rp.mock.calls.length).toEqual(1);

            expect(RequestPrinter.print.mock.calls[0][1].requestKey).toEqual('bar');
            expect(RequestPrinter.print.mock.calls.length).toEqual(1);

            done();
            
        });

        // resolve all the promises
        jest.runAllTimers();

    });

    it('RequestCommand catches logs network errors from request-promise in sync mode', (done) => {

        const program = { env: 'foo', args: ['foo'], sync: true };

        rp.jar = () => { return {} };
        
        rp.mockImplementation(() => { 
            return Promise.reject({ name: 'Error', message: 'rp error' });
        });

        console.error = jest.fn();

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(console.error.mock.calls.length).toEqual(1);
            expect(console.error.mock.calls[0][0]).toEqual('Error: rp error');

            done();
            
        });

        // resolve all the promises
        jest.runAllTimers();

    });

    it('RequestCommand catches logs network errors from request-promise in async mode', (done) => {

        const program = { env: 'foo', args: ['foo'], async: true };

        rp.jar = () => { return {} };
        
        rp.mockImplementation(() => { 
            return Promise.reject({ name: 'Error', message: 'rp error' });
        });

        console.error = jest.fn();

        requestCommand = new RequestCommand(program).exec().then(() => {

            expect(console.error.mock.calls.length).toEqual(1);
            expect(console.error.mock.calls[0][0]).toEqual('Error: rp error');

            done();
            
        });

        // resolve all the promises
        jest.runAllTimers();

    });

    it('it should skip args that are not request config keys', () => {
    
        const program = { env: 'foo', args: ['foo', 'missing'], sync: true };

        console.log = jest.fn();

        rp.jar = () => { return {} };

        requestCommand = new RequestCommand(program).exec();

        expect(console.log.mock.calls.length).toEqual(1);
        expect(console.log.mock.calls[0][0]).toEqual('[info] request "missing" not found in config. Skipping.');

    });

    it('it should log an error and exit if env config is not valid', () => {

        console.error = jest.fn();  
        process.exit = jest.fn();

        const program = { env: 'invalid', args: ['foo'], sync: true };

        console.log = jest.fn();

        rp.jar = () => { return {} };

        requestCommand = new RequestCommand(program).exec();

        expect(console.error.mock.calls.length).toEqual(2);
        expect(console.error.mock.calls[0][0]).toEqual('[Error] "invalid" env config is invalid:');
        expect(console.error.mock.calls[1][0]).toEqual('[Error] env error. Exiting.');
        expect(process.exit.mock.calls.length).toEqual(1);

    });

    it('it should log an error and exit if env config is missing and their is no default', () => {

        console.error = jest.fn();  
        process.exit = jest.fn();
        process.exit.mockImplementation(() => {});
        

        const program = { env: 'missing', args: [], sync: true };

        console.log = jest.fn();

        rp.jar = () => { return {} };

        requestCommand = new RequestCommand(program).exec();

        expect(console.error.mock.calls.length).toEqual(1);
        expect(console.error.mock.calls[0][0]).toEqual('[Error] env "missing" not found in config. Exiting.');
        expect(process.exit.mock.calls.length).toEqual(1);

    });

});
