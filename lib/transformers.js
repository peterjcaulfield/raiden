var Chance = require('chance'),
    chance = new Chance();

function getStringConfig(config) {

    var sanitizedConfig = Object.assign({
        length: 10,
        prefix: '',
        suffix: ''
    }, config);

    var charsLeft = sanitizedConfig.length - (sanitizedConfig.prefix.length + sanitizedConfig.suffix.length);

    if (charsLeft < 1) {
        throw Error('Suffix and prefix combine to or exceed max length for the transform');
    }

    return { length: charsLeft, prefix: sanitizedConfig.prefix, suffix: sanitizedConfig.suffix };
}

function alpha(config) {

    var config = getStringConfig(config),
        generated = chance.string({length: config.length, alpha: true})

    return `${config.prefix}${generated}${config.suffix}`;

}

function alphanum(config) {

    var config = getStringConfig(config),
        generated = chance.string({length: config.length,
                                  pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'})

    return `${config.prefix}${generated}${config.suffix}`;
}

function integer(config) {

  var config = Object.assign({ min: 0, max: 100 }, config);

  return chance.integer({ min: config.min, max: config.max });
}


module.exports = {
  alpha,
  alphanum,
  integer
}
