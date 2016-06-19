'use strict';

jest.unmock('../helpers');

describe('lib/helpers', () => {
    
    let helpers;

    beforeEach(() => {
        helpers = require('../helpers');
    });

    it('isFilePath should return true if a string is a filepath and false if not', () => {
        // for our purposes filepaths must have an extension
        const relativeFilePath = './file.txt',
              getAbsoluteFilePath = '/usr/local/test.txt',
              notAFilePath = '/bla/bla/foo';
        
        expect(helpers.isFilePath(relativeFilePath)).toBe(true);
        expect(helpers.isFilePath(getAbsoluteFilePath)).toBe(true);
        expect(helpers.isFilePath(notAFilePath)).toBe(false);
    });

    it('getPropSafely should allow safe access to object props', () => {

        const obj = { foo: 'bar' };

        expect(helpers.getPropSafely(obj, 'foo')).toEqual('bar');
        expect(helpers.getPropSafely(obj, 'baz')).toEqual(false);
        expect(helpers.getPropSafely(null, 'baz')).toEqual(false);
        expect(helpers.getPropSafely(obj, 'baz', 'fallback')).toEqual('fallback');
    });

    it('cloneWithDefinedProps returns object with undefined props deleted', () => {

        const obj = { foo: 'bar', baz: undefined }; 

        expect(helpers.cloneWithDefinedProps(obj)).toEqual({ foo: 'bar' });
    });

    it('setPropViaPath allows setting object props via prop path', () => {

        let obj = { 
            foo: 'bar', 
            baz: { 
                qux: 'wat' 
            } 
        };

        const expected = {
            foo: 1,
            baz: {
                qux: 2,
                buku: 3
            }
        };

        helpers.setPropViaPath(obj, 1, 'foo');
        helpers.setPropViaPath(obj, 2, 'baz.qux');
        // will create the prop if needed
        helpers.setPropViaPath(obj, 3, 'baz.buku');

        expect(obj).toEqual(expected);
    });
});
