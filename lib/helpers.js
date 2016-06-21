function isFilePath(path) {
    return /(?:\.([^.]+))?$/.exec(path)[1] ? true : false;
}

function parseJson(j) {
    var parsed = {};
    try {
        parsed = JSON.parse(j);
    } catch(e) {
        console.warn(e);
    }
    return parsed;
}

function getPropSafely(obj, key, fallback=false) {
  if (typeof obj === 'object' && obj !== null) {
    return obj.hasOwnProperty(key) ? obj[key] : fallback;
  }
  return fallback;
}

function cloneWithDefinedProps(obj) {
    return Object.keys(obj).reduce((sanitized, key) => {
        var value = obj[key];
        if (value !== null && value !== undefined) {
            sanitized[key] = value;
        }
        return sanitized;
    }, {})
}

function getConfigFilePath() {
    return `${process.env.HOME}/.axp/`;
}

function setPropViaPath(obj, value, path) {

    if (typeof path === "string") {
        path = path.split('.');
    }

    if (path.length > 1) {

        var p = path.shift();

        if (obj[p] === null || typeof obj[p] !== 'object') {
             obj[p] = {};
        }

        setPropViaPath(obj[p], value, path);

    } else {
        obj[path[0]] = value;
    }
}

function parseCookieStringToObject(cookies) {

    const cookiePairs = cookies.split(';');

    return cookiePairs.reduce((cookieObj, pair) => {

        if (pair.length) {
            keyValues = pair.split('=');
            cookieObj[keyValues[0].trim()] = keyValues[1];
        }

        return cookieObj;

    }, {});
}

function parseCookieObjectToString(cookies) {
  return Object.keys(cookies).reduce((pairs, key) => {
      pairs.push(`${key}=${cookies[key]};`);
      return pairs;
  }, []).join(' ');
}

module.exports = {
    isFilePath,
    parseJson,
    getPropSafely,
    cloneWithDefinedProps,
    getConfigFilePath,
    setPropViaPath,
    parseCookieStringToObject,
    parseCookieObjectToString
}
