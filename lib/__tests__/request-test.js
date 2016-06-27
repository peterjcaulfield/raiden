'use strict';

jest.unmock('../request.js');
// we have to tell jest to mock fs module
jest.mock('fs');

describe('lib/request', () => {

    let Request,
        //all Request deps
        fs,
        qs,
        helpers,
        transformer;

    beforeEach(() => {

        Request = require('../request');
        fs = require('fs'),
        qs = require('qs'),
        helpers = require('../helpers'),
        transformer = require('../transformer');
    });


    it('should parse raw config correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            endpoint: 'foo',
            headers: {},
            transforms: [],
            qs: {
                baz: 'qux'
            }
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/foo',
            method: config.method,
            headers: config.headers,
            qs: {
                baz: 'qux'
            }
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' });

        expect(request.config).toEqual(parsed);
    });

    it('should handle query string passed as user arg', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            endpoint: 'foo',
            headers: {},
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/foo',
            method: config.method,
            headers: config.headers,
            qs: {
                baz: 'qux'
            }
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com', qs: 'baz=qux' });
        qs.parse.mockReturnValueOnce({ baz: 'qux' });

        const request = new Request('foo', config, { env: 'bar.com', qs: 'baz=qux' });

        expect(request.config).toEqual(parsed);
    });
    return;

    it('should handle urlencoded form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            form: { foo: 'bar' },
            endpoint: '',
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/',
            method: config.method,
            headers: config.headers,
            form: config.form
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' });

        expect(request.config).toEqual(parsed);
    });

    it('should handle json payload correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'bar' },
            json: true,
            endpoint: '',
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/',
            method: config.method,
            headers: config.headers,
            body: config.body,
            json: true
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' });

        expect(request.config).toEqual(parsed);
    });

    it('should encode body of multipart form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            formData: { foo: 'bar' },
            endpoint: '',
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/',
            method: config.method,
            headers: config.headers,
            formData: config.formData
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' });

        expect(request.config).toEqual(parsed);
    });

    it('should handle uploads in multipart forms correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            formData: { foo: 'file.txt' },
            endpoint: '',
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/',
            method: config.method,
            headers: config.headers,
            formData: config.formData
        };

        helpers.isFilePath.mockReturnValueOnce(true);
        fs.createReadStream.mockReturnValueOnce('file.txt');
        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });
        
        const request = new Request('foo', config, { env: 'bar.com' });

        expect(request.config).toEqual(parsed);
        expect(fs.createReadStream.mock.calls.length).toEqual(1);
    });

    it('it should peform transform if one is specified in raw config', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
            enpoint: '',
            headers: { 'content-type': 'application/json' },
            transforms: [{
                transform: ['number', { min: 1, max: 10 }],
                key: 'foo'
            }]
        };

        const request = new Request('foo', config, { env: 'bar.com' });

        transformer.mockReturnValueOnce('buku');

        expect(helpers.setPropViaPath.mock.calls.length).toEqual(1);
        expect(helpers.setPropViaPath.mock.calls[0][0]).toEqual(config.body, 'buku', 'foo');        expect(transformer.mock.calls.length).toEqual(1);
        expect(transformer.mock.calls[0][0]).toEqual(config.transforms[0].transform);
    });

});

