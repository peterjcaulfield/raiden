'use strict';

jest.unmock('../request');

describe('lib/request', () => {

    it('should parse a GET request config correctly', () => {

        const Request = require('../request'); 
            
        const config = {
            protocol: 'http', 
            method: 'GET'
            body: '',
            query: '',
            enpoint: '',
            headers: {},
            transforms: []
        };

        const request = new Request('foo', config, { env: 'foo.com' });



    });
});
