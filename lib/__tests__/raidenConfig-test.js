jest.mock('path');
jest.mock('fs');
jest.unmock('../config');
jest.unmock('../raidenConfig');

describe('lib/config', () => {

    let fs,
        path,
        yaml,
        inspector,
        RaidenConfig;

    beforeEach(() => {
        fs = require('fs');
        path = require('path');
        yaml = require('js-yaml');
        inspector = require('schema-inspector');
        RaidenConfig = require('../raidenConfig');
    });


    it('should set an error prop directly if a config prop is invalid', () => {

        const update = { baz: 'buku', noodle: 'soup' };

        yaml.safeLoad.mockReturnValue({ baz: 'qux' });
        inspector.sanitize.mockReturnValue({ data: 'QUX' });
        inspector.validate.mockReturnValue({ valid: true });
        yaml.safeDump.mockReturnValue(update);
         

        const config = new RaidenConfig('config.yml', 'foo', 'bar');

        config.update(update);

        expect(yaml.safeDump.mock.calls.length).toEqual(1);
        expect(yaml.safeDump.mock.calls[0][0]).toEqual(update);
        expect(fs.writeFileSync.mock.calls.length).toEqual(1);
        expect(fs.writeFileSync.mock.calls[0][1]).toEqual(update);
        expect(config.get()).toEqual(update);

    })

});
