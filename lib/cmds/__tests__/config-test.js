jest.unmock('../config');

describe('lib/cmd/config', () => {

    let ConfigCmd,
        userConfigs,
        RaidenConfig

    beforeEach(() => {
        console.log = jest.fn();
    });

    it('config --list requests displays all request props in alphabetical order', () => {

        userConfigs = require('../../userConfigs');
        ConfigCmd = require('../config');

        const configCmd = new ConfigCmd({ list: 'requests' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(4);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('baz');
        expect(console.log.mock.calls[2][0]).toEqual('foo');
        expect(console.log.mock.calls[3][0]).toEqual('invalid');

    });

    it('config --list envs displays all env props in alphabetical order', () => {

        userConfigs = require('../../userConfigs');
        ConfigCmd = require('../config');

        const configCmd = new ConfigCmd({ list: 'envs' });

        configCmd.exec();

        expect(console.log.mock.calls.length).toEqual(3);
        expect(console.log.mock.calls[0][0]).toEqual('bar');
        expect(console.log.mock.calls[1][0]).toEqual('baz');
        expect(console.log.mock.calls[2][0]).toEqual('foo');

    });

    it('config --list displays all of the raiden config props in alphabetical order', () => {

        ConfigCmd = require('../config');

        const RaidenConfig = require('../../raidenConfig');

        const get = function(key) {

            let props = {
                reqfile: 'requests.yml',
                noodle: 'soup'
            };

            if (key) return props[key];

            return props;
        }

        RaidenConfig.mockImplementation(() => {
            return {
                get: get
            }
        });

        const configCmd = new ConfigCmd({ list: true });

        configCmd.exec();

        expect(console.log.mock.calls[0][0]).toEqual('noodle:soup');
        expect(console.log.mock.calls[1][0]).toEqual('reqfile:requests.yml');

    });


    it('config --set updates the the raiden config', () => {

        ConfigCmd = require('../config');

        const RaidenConfig = require('../../raidenConfig');

        const get = function(key) {

            let props = {
                reqfile: 'requests.yml',
                noodle: 'soup'
            };

            if (key) return props[key];

            return props;
        },
        update = jest.fn();

        RaidenConfig.mockImplementation(() => {
            return {
                get: get,
                update: update
            }
        });

        const configCmd = new ConfigCmd({ set: 'reqfile', args: ['foo.yml'] });

        configCmd.exec();

        expect(update.mock.calls.length).toEqual(1);
        expect(update.mock.calls[0][0]).toEqual({ reqfile: 'foo.yml'});

    });

});
