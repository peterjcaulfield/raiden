function isFilePath(path) {
    return /(?:\.([^.]+))?$/.exec(path)[1] ? true : false;
}

module.exports = {
    isFilePath: isFilePath
}
