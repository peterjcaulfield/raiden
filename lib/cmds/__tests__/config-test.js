jest.unmock('../config');
jest.mock('fs');

describe('lib/cmd/config', () => {

    let ConfigCmd,
        config,
        helpers;

    beforeEach(() => {

        config = require('../../config');
        ConfigCmd = require('../config');
        helpers = require('../../helpers');
        console.log = jest.fn();

        helpers.getConfigFilePath.mockReturnValue('~/');

    });

    it('config --list requests displays all request props in alphabetical order', () => {

        const configCmd = new ConfigCmd({ list: 'requests' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('baz');
        expect(console.log.mock.calls[2][0]).toEqual('foo');

    });

    it('config --list envs displays all env props in alphabetical order', () => {

        const configCmd = new ConfigCmd({ list: 'envs' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('default');
        expect(console.log.mock.calls[2][0]).toEqual('foo');

    });

    it('config --list displays the raiden config in alphabetical order', () => {

        const yaml = require('js-yaml'),
              fs = require('fs');

        fs.readFileSync.mockReturnValue('');
        yaml.safeLoad.mockReturnValue({ foo: 'bar', baz: 'qux' });

        const configCmd = new ConfigCmd({ list: true });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(2);
        expect(console.log.mock.calls[0][0]).toEqual('baz:qux');
        expect(console.log.mock.calls[1][0]).toEqual('foo:bar');

    });


    it('config --set updates the the raiden config', () => {

        const yaml = require('js-yaml'),
              fs = require('fs'),
              inspector = require('schema-inspector'),
              helpers = require('../../helpers'),
              update = { reqfile: 'foo.yml' };

        helpers.getConfigFilePath.mockReturnValue('/bar/')
        inspector.validate.mockReturnValue({ valid: true });
        yaml.safeDump.mockReturnValue(update);

        const configCmd = new ConfigCmd({ set: 'reqfile', args: ['foo.yml'] });

        configCmd.exec();

        expect(fs.writeFileSync.mock.calls[0][0]).toEqual('/bar/config.yml');
        expect(fs.writeFileSync.mock.calls[0][1]).toEqual(update);
    
    });

    it('config --set prevents setting the reqfile to an invalid value', () => {

        const yaml = require('js-yaml'),
              fs = require('fs'),
              inspector = require('schema-inspector'),
              helpers = require('../../helpers'),
              update = { reqfile: 'invalid_value' };

        inspector.validate.mockReturnValue({ valid: false, format: () => {} });
        console.error = jest.fn();

        const configCmd = new ConfigCmd({ set: 'reqfile', args: ['invalid_value'] });

        configCmd.exec();

        expect(console.error.mock.calls.length).toEqual(2);        
    });

});
