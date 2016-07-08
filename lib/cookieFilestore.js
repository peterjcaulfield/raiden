const tough = require('tough-cookie'),
      Store = tough.Store,
      permuteDomain = tough.permuteDomain,
      permutePath = tough.permutePath,
      fs = require('fs'),
      helpers = require('./helpers'),
      path = require('path');

class CookieFilestore extends Store {

    constructor() {

        super();

        this.synchronous = true;

        this.filePath = path.join(process.env.HOME, '.raiden', 'cookies.json');

        this.cookies = this._loadFromDisk();
    }

    findCookie(domain, path, key, cb) {

        if (!this.cookies[domain]) return cb(null, undefined);

        if (!this.cookies[domain][path]) return cb(null, undefined);

        return cb(null, this.cookies[domain][path][key] || null);
    }

    findCookies(domain, path, cb) {

        const results = [];

        if (!domain) {
            return cb(null, []);
        }

        let pathMatcher;

        if (!path) {
          // null means "all paths"
            pathMatcher = function matchAll(domainIndex) {

                for (let curPath in domainIndex) {

                    let pathIndex = domainIndex[curPath];

                    for (let key in pathIndex) {

                        results.push(pathIndex[key]);

                    }
                }
            };
        } else {
            // we have a path to base our match on
            pathMatcher = function matchRFC(domainIndex) {
                // create path match function based on chromium impl.
                // (see : https://github.com/ChromiumWebApps/chromium/blob/b3d3b4da8bb94c1b2e061600df106d590fda3620/net/cookies/canonical_cookie.cc#L299)
                function pathMatch(path, cookiePath) {

                    if (path.indexOf(cookiePath) !== 0) return false;

                    if (cookiePath.length != path.length &&
                        cookiePath[cookiePath.length - 1] !== '/' &&
                        path[cookiePath.length] !== '/')
                        return false;

                    return true;
                }

                Object.keys(domainIndex).forEach(function (cookiePath) {

                    if (pathMatch(path, cookiePath)) {

                        let pathIndex = domainIndex[cookiePath];

                        for (let key in pathIndex) {

                            results.push(pathIndex[key]);

                        }
                    }
                });
            };
        }

        const domains = permuteDomain(domain) || [domain],
            cookies = this.cookies;

        domains.forEach(function(curDomain) {

            let domainIndex = cookies[curDomain];

            if (!domainIndex) {
                return;
            }

            pathMatcher(domainIndex);
        });

        cb(null, results);
    }

    putCookie(cookie, cb) {

        const { domain, path, key } = cookie;

        helpers.setPropViaPath(this.cookies, cookie, `${domain}|${path}|${key}`, '|');

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

            } else {

                delete this.cookies[domain];

            }

        }

        this._saveToDisk();

        return cb(null);
    }

    getAllCookies(cb) {

        const cookies = [];

        this._cookieMap((cookie) => {
            cookies.push(cookie);
        });

        cookies.sort((a, b) => {
            return (a.creationIndex || 0) - (b.creationIndex || 0);
        });

        cb(null, cookies);
    }

    _cookieMap(func) {

        for (let domain in this.cookies) {

            for (let path in this.cookies[domain]) {

                for (let key in this.cookies[domain][path]) {

                    if (key !== null) {

                        func(this.cookies[domain][path][key]);

                    }

                }
            }
        }
    }

    _loadFromDisk() {

        let data,
            dataJson;

        try {
            data = fs.readFileSync(this.filePath);
            dataJson = data ? JSON.parse(data) : null;
        } catch(e) {
            return {};
        }

        for (let domain in dataJson) {

            for (let path in dataJson[domain]) {

                for (let key in dataJson[domain][path]) {

                    dataJson[domain][path][key] = tough.fromJSON(JSON.stringify(dataJson[domain][path][key]));

                }
            }
        }

        return dataJson;
    }

    _saveToDisk() {

        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.cookies));
        } catch (e) {
            console.error(`${e.error}: ${e.message}`);
            process.exit(1);
        }

    }
}

module.exports = CookieFilestore;
