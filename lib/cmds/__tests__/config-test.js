'use strict';

jest.unmock('../config');
jest.mock('fs');

describe('lib/cmd/config', () => {

    let ConfigCmd,
        config;

    beforeEach(() => {
        config = require('../../config');
        ConfigCmd = require('../config');
        console.log = jest.fn();
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

    it('config --list raiden displays the raiden config in alphabetical order', () => {

        const yaml = require('js-yaml'),
              fs = require('fs');

        fs.readFileSync.mockReturnValue('');
        yaml.safeLoad.mockReturnValue({ foo: 'bar', baz: 'qux' });

        const configCmd = new ConfigCmd({ list: 'raiden' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(2);
        expect(console.log.mock.calls[0][0]).toEqual('baz:qux');
        expect(console.log.mock.calls[1][0]).toEqual('foo:bar');

    });

});
