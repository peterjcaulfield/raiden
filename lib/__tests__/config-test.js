jest.mock('path');
jest.mock('fs');
jest.unmock('../config');

describe('lib/config', () => {

    let fs,
        path,
        yaml,
        inspector,
        Config;

    beforeEach(() => {
        jest.clearAllMocks();
        fs = require('fs');
        path = require('path');
        yaml = require('js-yaml');
        inspector = require('schema-inspector');
        Config = require('../config');

    });

    it('should load from disk correctly with supplied filepath', () => {

        const filepath = '~/.raiden/test.yml';
        process.env.HOME = '~/';
        path.join.mockReturnValue(filepath);
        fs.readFileSync.mockReturnValue('config');

        const config = new Config('test.yml');

        expect(path.join.mock.calls[0][0]).toEqual('~/');
        expect(path.join.mock.calls[0][1]).toEqual('.raiden');
        expect(path.join.mock.calls[0][2]).toEqual('test.yml');
        expect(fs.readFileSync.mock.calls[0][0]).toEqual(filepath);
        expect(yaml.safeLoad.mock.calls[0][0]).toEqual('config');

    });

    it('should sanitize then validate the config data correctly', () => {

        yaml.safeLoad.mockReturnValue({ baz: 'qux' });
        inspector.sanitize.mockReturnValue({ data: 'QUX' });
        inspector.validate.mockReturnValue({ valid: true });

        const config = new Config('test.yml', 'foo', 'bar');

        expect(inspector.sanitize.mock.calls.length).toEqual(1);
        expect(inspector.sanitize.mock.calls[0][0]).toEqual('foo');
        expect(inspector.sanitize.mock.calls[0][1]).toEqual('qux');
        expect(inspector.validate.mock.calls.length).toEqual(1);
        expect(inspector.validate.mock.calls[0][0]).toEqual('bar');
        expect(inspector.validate.mock.calls[0][1]).toEqual('QUX');
        expect(config.get()).toEqual({ baz: 'QUX' });
    
    })

    it('should set an error prop directly if a config prop is invalid', () => {

        yaml.safeLoad.mockReturnValue({ baz: 'qux' });
        inspector.sanitize.mockReturnValue({ data: 'QUX' });
        inspector.validate.mockReturnValue({ valid: false, format: () => 'oops' });

        const config = new Config('test.yml', 'foo', 'bar');

        expect(config.get()).toEqual({ baz: { error: 'oops' } });
    
    })

    it('should log the error and exit if fs module throws an error', () => {

        console.error = jest.fn();
        process.exit = jest.fn();

        fs.readFileSync = () => {
            throw new Error('fs error');
        }

        const config = new Config('test.yml', 'foo', 'bar');

        expect(console.error.mock.calls.length).toEqual(1);
        expect(console.error.mock.calls[0][0]).toEqual('Error: fs error');
        expect(process.exit.mock.calls.length).toEqual(1);
        expect(process.exit.mock.calls[0][0]).toEqual(1);
            
    });

    it('should log the error and exit if js-yaml module throws an error', () => {

        console.error = jest.fn();
        process.exit = jest.fn();
        fs.readFileSync = () => {};

        yaml.safeLoad = () => {
            throw new Error('yaml error');
        }

        const config = new Config('test.yml', 'foo', 'bar');

        expect(console.error.mock.calls.length).toEqual(1);
        expect(console.error.mock.calls[0][0]).toEqual('Error: yaml error');
        expect(process.exit.mock.calls.length).toEqual(1);
        expect(process.exit.mock.calls[0][0]).toEqual(1);
            
    });

});
