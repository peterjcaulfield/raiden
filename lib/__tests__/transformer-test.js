'use strict';

jest.unmock('../transformer');

describe('lib/transformer', () => {

    let transformer,
        Chance;

    beforeEach(() => {
        transformer = require('../transformer');
        Chance = require('chance');
    });

    it('should return chance lib invocation correctly', () => {

        const args = { max: 10 };
        const config = ['integer', args];

        Chance.mock.instances[0].integer.mockReturnValueOnce(7);

        const gen = transformer(config);

        expect(gen).toBe(7);
    });

    it('should handle prefix and suffix correctly', () => {

        Chance.mock.instances[0].string.mockReturnValue('the');

        const prefixed = transformer(['string', { prefix: 'run_' }]);
        const suffixed = transformer(['string', { suffix: '_jewels' }]);
        const prefixedAndSuffixed = transformer(['string', { prefix: 'run_', suffix: '_jewels' }]);

        expect(prefixed).toBe('run_the');
        expect(suffixed).toBe('the_jewels');
        expect(prefixedAndSuffixed).toBe('run_the_jewels');
    });
});
