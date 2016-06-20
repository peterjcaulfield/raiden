'use strict';

jest.unmock('../list');

describe('lib/cmd/list', () => {

    let list,
        config;

    beforeEach(() => {
        config = require('../../config');
        list = require('../list');
        console.log = jest.fn();
    });

    it('list displays all request keys in alphabetical order by default', () => {

        list.exec({});

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('baz');
        expect(console.log.mock.calls[2][0]).toEqual('foo');
    });

    it('list displays all env keys in alphabetical order with --e flag', () => {

        list.exec({envs: true});

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('default');
        expect(console.log.mock.calls[2][0]).toEqual('foo');
    });

});
