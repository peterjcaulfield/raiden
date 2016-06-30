'use strict';

jest.unmock('../config');

describe('lib/cmd/config', () => {

    let ConfigCmd,
        config;

    beforeEach(() => {
        config = require('../../config');
        ConfigCmd = require('../config');
        console.log = jest.fn();
    });

    it('list displays all request keys in alphabetical order by default', () => {

        const configCmd = new ConfigCmd({ list: 'requests' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('baz');
        expect(console.log.mock.calls[2][0]).toEqual('foo');

    });

    it('list displays all env keys in alphabetical order with --e flag', () => {

        const configCmd = new ConfigCmd({ list: 'envs' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('default');
        expect(console.log.mock.calls[2][0]).toEqual('foo');

    });

});
