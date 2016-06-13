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

function getPropSafely(obj, key, fallback) {
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

function getAbsoluteFilePath(path) {
    return `${process.env.HOME}/.axp/${path}`;
}

module.exports = {
    isFilePath,
    parseJson,
    getPropSafely,
    cloneWithDefinedProps,
    getAbsoluteFilePath
}
