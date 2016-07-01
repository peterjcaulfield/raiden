'use strict';

jest.unmock('../config');
jest.mock('fs');

describe('lib/config', () => {

    let config,
        yaml,
        fs,
       inspector,
        schemas;

    beforeEach(() => {
        yaml = require('js-yaml'),
        fs   = require('fs'),
        inspector = require('schema-inspector'),
        schemas = require('../schemas');
    });

    it('should load config sanitized configs if config is valid', () => {

        const requestConfig = { foo: 'bar', turtle: 'soup' },
              envConfig = { baz: 'qux' },
              sanitizedRequestConfig = { foo: 'BAR', turtle: 'SOUP' },
              sanitizedEnvConfig = { baz: 'QUX' };

        // return a raw config
        yaml.safeLoad.mockReturnValueOnce({});
        yaml.safeLoad.mockReturnValueOnce(envConfig);
        yaml.safeLoad.mockReturnValueOnce(requestConfig);

        // return a sanitized config
        inspector.sanitize.mockReturnValueOnce({ data: sanitizedEnvConfig });
        inspector.sanitize.mockReturnValueOnce({ data: sanitizedRequestConfig.foo });
        inspector.sanitize.mockReturnValueOnce({ data: sanitizedRequestConfig.turtle });

        // sanitized config always validates as true
        inspector.validate.mockReturnValue({ valid: true });

        config = require('../config');

        expect(inspector.sanitize.mock.calls.length).toEqual(3);
        expect(inspector.validate.mock.calls.length).toEqual(1);
    
        expect(config).toEqual({ envs: sanitizedEnvConfig, requests: sanitizedRequestConfig });

    });
});
