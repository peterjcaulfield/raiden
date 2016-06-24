'use strict';

jest.unmock('../request.js');
// we have to tell jest to mock fs module
jest.mock('fs');

describe('lib/request', () => {

    let Request,
        //all Request deps
        fs,
        qs,
        FormData,
        helpers,
        transformer,
        tough,
        CookieFilestore;

    beforeEach(() => {

        Request = require('../request');
        fs = require('fs'),
        qs = require('qs'),
        FormData = require('form-data'),
        helpers = require('../helpers'),
        transformer = require('../transformer'),
        tough = require('tough-cookie'),
        CookieFilestore = require('../cookieFilestore');

        // mock out the CookieJar implementation as we need
        // to execute a callback from the getCookies method
        tough.CookieJar.mockImplementation(() => {
            return {
                getCookies: (url, func) => {
                    func(undefined, []);
                }
            };
        });

    });

    it('should parse raw config correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: '',
            endpoint: 'foo',
            query: 'baz=qux',
            headers: {},
            cookies: {},
            transforms: []
        },
        parsed = {
            method: config.method,
            body: config.body,
            headers: config.headers
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config).toEqual(parsed);
        expect(request.url).toEqual('http://bar.com/foo?baz=qux');
    });

    it('should handle merge cookie headers correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: '',
            endpoint: 'foo',
            query: '',
            headers: {},
            cookies: { buku: 'musu' },
            transforms: []
        },
        parsed = {
            method: config.method,
            body: config.body,
            headers: {
                cookie: 'foo=bar; baz=qux; buku=musu'
            }
        };

        // let's return some cookies
        tough.CookieJar.mockImplementation(() => {
            return {
                getCookies: (url, func) => {
                    func(undefined, ['foo=bar', 'baz=qux']);
                }
            };
        });

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config).toEqual(parsed);
    });

    it('should encode body of a url encoded form request correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'bar' },
            query: '',
            endpoint: '',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            cookies: {},
            transforms: []
        };

        qs.stringify.mockReturnValueOnce('foo=bar');

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toBe('foo=bar');
        expect(request.config.headers['content-length']).toEqual(Buffer.byteLength(request.config.body));
    });

    it('should encode body of a json request correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'bar' },
            query: '',
            endpoint: '',
            headers: { 'content-type': 'application/json' },
            cookies: {},
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toBe(JSON.stringify(config.body));
    });

    it('should encode body of multipart form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'bar' },
            query: '',
            endpoint: '',
            headers: { 'content-type': 'multipart/form-data' },
            cookies: {},
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toEqual(jasmine.any(FormData));
        expect(request.config.body.append.mock.calls.length).toEqual(1);
    });

    it('should handle uploads in multipart forms correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'file.txt' },
            query: '',
            endpoint: '',
            headers: { 'content-type': 'multipart/form-data' },
            cookies: {},
            transforms: []
        };

        helpers.isFilePath.mockReturnValueOnce(true);
        fs.createReadStream.mockReturnValue('filestream');

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toEqual(jasmine.any(FormData));
        expect(request.config.body.append.mock.calls.length).toEqual(1);
        expect(request.config.body.append.mock.calls[0][1]).toEqual('filestream');
    });

    it('it should peform transform if one is specified in raw config', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
            query: '',
            enpoint: '',
            headers: { 'content-type': 'application/json' },
            cookies: {},
            transforms: [{
                transform: ['number', { min: 1, max: 10 }],
                key: 'foo'
            }]
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        transformer.mockReturnValueOnce('buku');

        expect(helpers.setPropViaPath.mock.calls.length).toEqual(1);
        expect(helpers.setPropViaPath.mock.calls[0][0]).toEqual(config.body, 'buku', 'foo');
        expect(transformer.mock.calls.length).toEqual(1);
        expect(transformer.mock.calls[0][0]).toEqual(config.transforms[0].transform);
    });
});
