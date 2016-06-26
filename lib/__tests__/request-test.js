'use strict';

jest.unmock('../request.js');
// we have to tell jest to mock fs module
jest.mock('fs');

describe('lib/request', () => {

    let Request,
        //all Request deps
        fs,
        helpers,
        transformer;

    beforeEach(() => {

        Request = require('../request');
        fs = require('fs'),
        helpers = require('../helpers'),
        transformer = require('../transformer');
    });

    it('should parse raw config correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            endpoint: 'foo',
            headers: {},
            cookies: {},
            transforms: []
        },
        parsed = {
            resolveWithFullResponse: true,
            simple: false,
            uri: 'http://bar.com/foo',
            method: config.method,
            headers: config.headers
        };

        helpers.cloneWithDefinedProps.mockReturnValueOnce({ env: 'bar.com' });

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config).toEqual(parsed);
    });

    it('should handle urlencoded form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            form: { foo: 'bar' },
            endpoint: '',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            cookies: {},
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.form).toBe(config.form);
    });

    it('should handle json payload correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            body: { foo: 'bar' },
            endpoint: '',
            headers: { 'content-type': 'application/json' },
            cookies: {},
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.json).toBe(true);
    });

    it('should encode body of multipart form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            form: { foo: 'bar' },
            endpoint: '',
            headers: { 'content-type': 'multipart/form-data' },
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.formData).toEqual(jasmine.any(Object));
    });

    it('should handle uploads in multipart forms correctly', () => {

        const config = {
            protocol: 'http',
            method: 'POST',
            form: { foo: 'file.txt' },
            endpoint: '',
            headers: { 'content-type': 'multipart/form-data' },
            cookies: {},
            transforms: []
        };

        helpers.isFilePath.mockReturnValueOnce(true);

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.formData).toEqual(jasmine.any(Object));
        expect(fs.createReadStream.mock.calls.length).toEqual(1);
    });

    it('it should peform transform if one is specified in raw config', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
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
