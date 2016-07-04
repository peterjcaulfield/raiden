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

function getConfigFilePath() {
    return `${process.env.HOME}/.raiden/`;
}

function setPropViaPath(obj, value, path, delimeter=".") {

    if (typeof path === "string") {
        //TODO find a more appropriate path separator ?
        path = path.split(delimeter);
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
    getConfigFilePath,
    setPropViaPath,
    noop
};
