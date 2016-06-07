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

module.exports = {
    isFilePath, 
    parseJson
}
