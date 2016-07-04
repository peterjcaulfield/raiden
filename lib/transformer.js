const Chance = require('chance'),
      chance = new Chance();

function transformer(config) {

    if (config.prefix || config.suffix) {

        const cleaned = Object.assign({}, { prefix: '', suffix: '', args: {} }, config);

        return `${cleaned.prefix}${chance[cleaned.method](cleaned.args)}${cleaned.suffix}`;
    }

    return chance[config.method](config.args);
}

module.exports = transformer;
