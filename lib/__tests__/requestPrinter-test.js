jest.unmock('../requestPrinter');

describe('lib/config', () => {

    const printer = require('../requestPrinter');

    beforeEach(() => {

        console.log = jest.fn();

    });

    it('minimal option only prints the status line', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            request: {
                method: 'GET',
                href: 'http://foo.com'
            }
        };

        printer.print({ minimal: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(1);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms  [200] GET http://foo.com');

    });

    it('header option prints status line and headers', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            headers: {
                foo: 'bar'
            },
            request: {
                method: 'GET',
                href: 'http://foo.com',
                headers: {
                    baz: 'qux'
                }
            }
        };

        printer.print({ headers: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] GET http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request headers:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.headers);
        expect(console.log.mock.calls[3][0]).toEqual('<= response headers:');
        expect(console.log.mock.calls[4][0]).toEqual(resp.headers);

    });

    it('body options prints status line and body', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            body: {
                foo: 'bar'
            },
            headers: {
                'content-type': 'text/plain'
            },
            request: {
                method: 'POST',
                headers: {
                    'content-type':  'text/plain'
                },
                href: 'http://foo.com',
                body: {
                    baz: 'qux'
                }
            }
        };

        printer.print({ body: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] POST http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request body:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.body);
        expect(console.log.mock.calls[3][0]).toEqual('<= response body:');
        expect(console.log.mock.calls[4][0]).toEqual(resp.body);

    });

    it('no print options prints everything', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            body: {
                foo: 'bar'
            },
            headers: {
                'content-type': 'text/plain'
            },
            request: {
                method: 'POST',
                headers: {
                    'content-type':  'text/plain'
                },
                href: 'http://foo.com',
                body: {
                    baz: 'qux'
                }
            }
        };

        printer.print({}, request, resp);

        expect(console.log.mock.calls.length).toEqual(9);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] POST http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request headers:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.headers);
        expect(console.log.mock.calls[3][0]).toEqual('=> request body:');
        expect(console.log.mock.calls[4][0]).toEqual(resp.request.body);
        expect(console.log.mock.calls[5][0]).toEqual('<= response headers:');
        expect(console.log.mock.calls[6][0]).toEqual(resp.headers);
        expect(console.log.mock.calls[7][0]).toEqual('<= response body:');
        expect(console.log.mock.calls[8][0]).toEqual(resp.body);

    });

    it('JSON strings in request/response body are parsed before printing', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            body: JSON.stringify({ baz: 'qux' }),
            headers: {
                'content-type': 'application/json'
            },
            request: {
                method: 'POST',
                headers: {
                    'content-type':  'application/json'
                },
                href: 'http://foo.com',
                body: JSON.stringify({ foo: 'bar' }),
            }
        };

        JSON.parse = jest.fn();
        JSON.parse.mockReturnValueOnce({ foo: 'bar' });
        JSON.parse.mockReturnValueOnce({ baz: 'qux' });

        printer.print({ body: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] POST http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request body:');
        expect(console.log.mock.calls[2][0]).toEqual({ foo: 'bar' });
        expect(console.log.mock.calls[3][0]).toEqual('<= response body:');
        expect(console.log.mock.calls[4][0]).toEqual({ baz: 'qux' });
        expect(JSON.parse.mock.calls.length).toEqual(2);
        expect(JSON.parse.mock.calls[0][0]).toEqual(resp.request.body);
        expect(JSON.parse.mock.calls[1][0]).toEqual(resp.body);

    });

    it('formData in request body is printed', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            body: {
                foo: 'bar'
            },
            headers: {
                'content-type': 'text/plain'
            },
            request: {
                method: 'POST',
                headers: {
                    'content-type':  'multipart/form-data'
                },
                href: 'http://foo.com',
                formData: {
                    baz: 'qux'
                }
            }
        };

        printer.print({ body: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] POST http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request body:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.formData);
        expect(console.log.mock.calls[3][0]).toEqual('<= response body:');
        expect(console.log.mock.calls[4][0]).toEqual(resp.body);

    });

    it('url encoded form body is printed', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            body: {
                foo: 'bar'
            },
            headers: {
                'content-type': 'text/plain'
            },
            request: {
                method: 'POST',
                headers: {
                    'content-type':  'application/x-www-form-urlencoded'
                },
                href: 'http://foo.com',
                body: {
                    baz: 'qux'
                }
            }
        };

        printer.print({ body: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] POST http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request body:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.body);
        expect(console.log.mock.calls[3][0]).toEqual('<= response body:');
        expect(console.log.mock.calls[4][0]).toEqual(resp.body);

    });

    it('header arrays in response are handled correctly', () => {

        const request = {
            getExecutionTime: () => { return '0:100ms'; }
        },
        resp = {
            statusCode: '200',
            headers: {
                cookie: ['foo=bar', 'baz=qux']
            },
            request: {
                method: 'GET',
                href: 'http://foo.com',
                headers: {
                    baz: 'qux'
                }
            }
        };

        printer.print({ headers: true }, request, resp);

        expect(console.log.mock.calls.length).toEqual(5);
        expect(console.log.mock.calls[0][0]).toEqual('0:100ms [200] GET http://foo.com');
        expect(console.log.mock.calls[1][0]).toEqual('=> request headers:');
        expect(console.log.mock.calls[2][0]).toEqual(resp.request.headers);
        expect(console.log.mock.calls[3][0]).toEqual('<= response headers:');
        expect(console.log.mock.calls[4][0]).toEqual({ cookie: 'foo=bar; baz=qux' });

    });

});
