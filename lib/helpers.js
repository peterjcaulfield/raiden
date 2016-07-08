function isFilePath(path) {
    return /(?:\.([^.]+))?$/.exec(path)[1] ? true : false;
}

function getPropSafely(obj, key, fallback=false) {
  if (typeof obj === 'object' && obj !== null) {
    return obj.hasOwnProperty(key) ? obj[key] : fallback;
  }
  return fallback;
}

function cloneWithDefinedProps(obj) {
    return Object.keys(obj).reduce((sanitized, key) => {
        let value = obj[key];
        if (value !== null && value !== undefined) {
            sanitized[key] = value;
        }
        return sanitized;
    }, {});
}

function setPropViaPath(obj, value, path, delimiter='.') {

    if (typeof path === "string") {
        path = path.split(delimiter);
    }

    if (path.length > 1) {

        let p = path.shift();

        if (obj[p] === null || typeof obj[p] !== 'object') {
             obj[p] = {};
        }

        setPropViaPath(obj[p], value, path);

    } else {
        obj[path[0]] = value;
    }
}

function noop() {}

module.exports = {
    isFilePath,
    getPropSafely,
    cloneWithDefinedProps,
    setPropViaPath,
    noop
};
