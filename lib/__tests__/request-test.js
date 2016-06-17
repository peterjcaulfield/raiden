'use strict';

jest.unmock('../request.js');

describe('lib/request', () => {

    let Request,
        //all Request deps
        fs,
        qs,
        helpers,
        FormData,
        transformer;

    beforeEach(() => {

        Request = require('../request');
        fs = require('fs'),
        qs = require('qs'),
        helpers = require('../helpers'),
        FormData = require('form-data'),
        transformer = require('../transformer');
    });


    it('should encode body of a url encoded form request correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
            query: '',
            enpoint: '',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            transforms: []
        };

        qs.stringify = jest.fn();
        qs.stringify.mockReturnValueOnce('foo=bar');

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toBe('foo=bar');
    });

    it('should encode body of a json request correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
            query: '',
            enpoint: '',
            headers: { 'content-type': 'application/json' },
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toBe(JSON.stringify(config.body));
    });

    it('should encode body of multipart form correctly', () => {

        const config = {
            protocol: 'http',
            method: 'GET',
            body: { foo: 'bar' },
            query: '',
            enpoint: '',
            headers: { 'content-type': 'multipart/form-data' },
            transforms: []
        };

        const request = new Request('foo', config, { env: 'bar.com' } );

        expect(request.config.body).toEqual(jasmine.any(FormData));
        expect(request.config.body.append.mock.calls.length).toEqual(1);
    });
});
