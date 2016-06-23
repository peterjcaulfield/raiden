'use strict';

jest.unmock('../cookieFilestore');
jest.mock('fs');

describe('lib/cookieFilestore', () => {

      let tough,
          Store,
          permuteDomain,
          permutePath,
          fs,
          CookieFilestore,
          cookieFilestore,
          helpers;

      let cookiesStub;

    beforeEach(() => {

          tough = require('tough-cookie');
          Store = tough.Store;
          permuteDomain = tough.permuteDomain;
          permutePath = tough.permutePath;
          fs = require('fs');
          helpers = require('../helpers');

          // handle mocking of cookie read from disk
          cookiesStub = {
              'foo.com' : {       // domain
                  '/bar': {       // path
                      noodle: 'soup'  // cookie key/value
                  },
                  '/baz': {
                      buku: 'musu'
                  }
              },
              'hooli.com': {
                  '/belson' : {
                      giant: 'moron'
                  }
              }
          };

          helpers.getConfigFilePath.mockReturnValue('~/');
          fs.readFileSync.mockReturnValue(JSON.stringify(cookiesStub));
          tough.fromJSON.mockReturnValueOnce('soup');
          tough.fromJSON.mockReturnValueOnce('musu');
          tough.fromJSON.mockReturnValueOnce('moron');

          CookieFilestore = require('../cookieFilestore');
          cookieFilestore = new CookieFilestore();

    });

    it('loads cookies from disk on instantiation', () => {

        expect(fs.readFileSync.mock.calls[0][0]).toEqual('~/cookies.json');
        expect(cookieFilestore.cookies).toEqual(cookiesStub);

    });

    it('findCookie executes callback with cookie if it exists', () => {

        const callback = jest.fn();

        cookieFilestore.findCookie('foo.com', '/bar', 'noodle', callback);

        expect(callback.mock.calls[0][1]).toEqual('soup');

    });

    it('findCookies returns all cookies for a domain when no path is given', () => {

        const callback = jest.fn();

        cookieFilestore.findCookies('foo.com', null, callback);

        expect(callback.mock.calls[0][1]).toEqual(['soup', 'musu']);

    });

    it('findCookies return all cookies for a domain and path', () => {

        const callback = jest.fn();

        cookieFilestore.findCookies('foo.com', '/bar', callback);

        expect(callback.mock.calls[0][1]).toEqual(['soup']);

    });

    it('findCookies return all cookies for a subdomain', () => {

        const callback = jest.fn();

        permuteDomain.mockReturnValue(['bar.foo.com', 'foo.com']);

        cookieFilestore.findCookies('bar.foo.com', null, callback);

        expect(callback.mock.calls[0][1]).toEqual(['soup', 'musu']);

    });

    it('findCookies returns empty array if no cookies are found for the domain', () => {

        const callback = jest.fn();

        cookieFilestore.findCookies('qux.com', null, callback);

        expect(callback.mock.calls[0][1]).toEqual([]);

    });

    it('findCookies returns empty array if no cookies are found for the path', () => {

        const callback = jest.fn();

        cookieFilestore.findCookies('foo.com', '/qux', callback);

        expect(callback.mock.calls[0][1]).toEqual([]);

    });

    it('findCookies pathMatcher matches correctly', () => {

        const callback = jest.fn();

        // should not match
        cookieFilestore.findCookies('foo.com', '/barbar', callback);
        // should match
        cookieFilestore.findCookies('foo.com', '/bar/', callback);

        expect(callback.mock.calls[0][1]).toEqual([]);
        expect(callback.mock.calls[1][1]).toEqual(['soup']);

    });

    it('putCookie should update cookies and write to disk', () => {

        const callback = jest.fn();

        const cookie = {
            domain: 'foo.com',
            path: '/bar',
            key: 'rylo'
        };

        cookieFilestore.putCookie(cookie, () => {});

        // assert we update cookie obj
        expect(helpers.setPropViaPath.mock.calls[0][0]).toEqual(cookieFilestore.cookies);
        expect(helpers.setPropViaPath.mock.calls[0][1]).toEqual(cookie);
        expect(helpers.setPropViaPath.mock.calls[0][2]).toEqual('foo.com|/bar|rylo');

        // assert we perform the write
        expect(fs.writeFileSync.mock.calls[0][0]).toEqual(cookieFilestore.filePath);
        expect(fs.writeFileSync.mock.calls[0][1]).toEqual(JSON.stringify(cookieFilestore.cookies));

    });

    it('updateCookie should update cookies and write to disk', () => {

        const callback = jest.fn();

        const cookie = {
            domain: 'foo.com',
            path: '/bar',
            key: 'rylo'
        };

        cookieFilestore.updateCookie(null, cookie, () => {});

        // assert we update cookie obj
        expect(helpers.setPropViaPath.mock.calls[0][0]).toEqual(cookieFilestore.cookies);
        expect(helpers.setPropViaPath.mock.calls[0][1]).toEqual(cookie);
        expect(helpers.setPropViaPath.mock.calls[0][2]).toEqual('foo.com|/bar|rylo');

        // assert we perform the write
        expect(fs.writeFileSync.mock.calls[0][0]).toEqual(cookieFilestore.filePath);
        expect(fs.writeFileSync.mock.calls[0][1]).toEqual(JSON.stringify(cookieFilestore.cookies));

    });

    it('removeCookie should delete cookie and write to disk', () => {

        cookieFilestore.removeCookie('foo.com', '/bar', 'noodle', () => {});

        delete cookiesStub['foo.com']['/bar']['noodle'];

        expect(fs.writeFileSync.mock.calls.length).toEqual(1);
        expect(cookieFilestore.cookies).toEqual(cookiesStub);

    });

    it('removeCookies should delete cookies by domain and write to disk', () => {

        delete cookiesStub['foo.com'];

        cookieFilestore.removeCookies('foo.com', null, () => {});

        expect(fs.writeFileSync.mock.calls.length).toEqual(1);
        expect(cookieFilestore.cookies).toEqual(cookiesStub);

    });

    it('removeCookies should delete cookies by domain and path and write to disk', () => {

        delete cookiesStub['foo.com']['/bar'];

        cookieFilestore.removeCookies('foo.com', '/bar', () => {});

        expect(fs.writeFileSync.mock.calls.length).toEqual(1);
        expect(cookieFilestore.cookies).toEqual(cookiesStub);

    });

    it('getAllCookies returns all cookies', () => {

        const callback = jest.fn();

        cookieFilestore.getAllCookies(callback);

        expect(callback.mock.calls[0][1]).toEqual(['soup', 'musu', 'moron']);

    });

});
