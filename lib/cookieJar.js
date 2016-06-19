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
        try {
            fs.writeFile(this._cookiePath, yaml.safeDump(this._cookieJar));
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    }

    _read() {

        let data;

        try {
            yaml.safeLoad(fs.readFileSync(this._cookiePath));
        } catch (e) {
        
        }

        return data || {};
    }
}

module.exports = CookieJar;
