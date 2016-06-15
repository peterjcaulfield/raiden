var Chance = require('chance'),
    chance = new Chance();

function transformer(config) {

    var method = config[0],
        args   = config[1] || {};

    if (args.prefix || args.suffix) {

        args = Object.assign({ prefix: '', suffix: ''}, args);

        return `${args.prefix}${chance[method](args)}${args.suffix}`
    }

    return chance[method](args);
}

module.exports = transformer;
