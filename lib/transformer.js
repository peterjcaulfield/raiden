var Chance = require('chance'),
    chance = new Chance();

function transformer(config) {
    return chance[config[0]](config[1] || {});
}

module.exports = transformer;
