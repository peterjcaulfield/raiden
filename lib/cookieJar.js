"use strict"

const fs = require('fs'),
      helpers = require('helpers');

//TODO sanity checks
class CookieJar() {

    constructor() {
        this._cookiePath = helpers.getConfigPath() + 'cookies.yml';
        this._cookieJar = this._read();
    }

    getAll() {
        return this._cookieJar;
    }

    write(cookies) {
        this._cookieJar = Object.assign({}, this._cookieJar, cookies);                    
        // write new file 
        fs.writeFile(this._cookiePath, yaml.safeDump(this._cookieJar));
    }

    _read() {
        return yaml.safeLoad(fs.readFileSync(this._cookiePath));
    }
}

module.exports = CookieJar;
