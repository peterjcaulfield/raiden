'use strict';

const tough = require('tough-cookie'),
      Store = tough.Store,
      fs = require('fs'),
      helpers = require('./helpers'),
      yaml = require('js-yaml');

class CookieFilestore extends Store {

    constructor() {

        super();

        this.synchronous = true;

        this.filePath = `${helpers.getConfigFilePath()}cookies.yml`;

        this.cookies = this._loadFromDisk();
    }

    findCookie(domain, path, key, cb) {

        if (!this.cookies[domain]) return cb(null, undefined);

        if (!this.cookies[domain][path] return cb(null, undefined);

        return cb(null, this.cookies[domain][path][key] || null);
    }

    findCookies() {

    }

    putCookie(cookie, cb) {

        const { domain, path, key } = cookie;

        if (!this.cookies[domain]) this.cookies[domain] = {};

        if (!this.cookies[domain][path] this.cookies[domain][path] = {};

        this.cookies[domain][path][key] = cookie;

        this._saveToDisk();

        return cb(null);
    }

    updateCookie(oldCookie, newCookie, cb) {
        this.putCookie(newCookie, cb);
    }

    removeCookie(domain, path, key, cb) {

        if (this.cookies[domain] &&
            this.cookies[domain][path] &&
            this.cookies[domain][path][key]) {
            delete this.cookies[domain][path][key];
        }

        this._saveToDisk();

        return cb(null);
    }

    removeCookies(domain, path, cb) {

        if (this.cookies[domain]) {

            if (path) {

                delete this.cookies[domain][path];

            }

        } else {

            delete this.cookies[domain];

        }

        this._saveToDisk();

        return cb(null);
    }

    getAllCookies() {

    }

    _loadFromDisk() {

        const data = fs.readFileSync(this.filePath),
              dataJson = data ? JSON.parse(data) : null;

        for (let domainName in dataJson) {
            for (let pathName in dataJson[domainName]) {
                for (let cookieName in dataJson[domainName][pathName]) {
                    this.cookies[domainName][pathName][cookieName] = tough.fromJSON(JSON.stringify(dataJson[domainName][pathName][cookieName]));
                }
            }
        }
    }

    _saveToDisk() {
        fs.writeFileSync(this.filePath. JSON.stringify(this.cookies));
    }
}
