jest.unmock('../transformer');

describe('lib/transformer', () => {

    let transformer,
        Chance;

    beforeEach(() => {
        transformer = require('../transformer');
        Chance = require('chance');
    });

    it('should return chance lib invocation correctly', () => {

        const config = { method: 'integer', args: { max: 10 } };

        Chance.mock.instances[0].integer.mockReturnValueOnce(7);

        const gen = transformer(config);

        expect(gen).toBe(7);
    });

    it('should handle prefix and suffix correctly', () => {

        Chance.mock.instances[0].string.mockReturnValue('the');

        const prefixed = transformer({ method: 'string', prefix: 'run_' });
        const suffixed = transformer({ method: 'string', suffix: '_jewels' });
        const prefixedAndSuffixed = transformer({ method: 'string',  prefix: 'run_', suffix: '_jewels' });

        expect(prefixed).toBe('run_the');
        expect(suffixed).toBe('the_jewels');
        expect(prefixedAndSuffixed).toBe('run_the_jewels');
    });
});
