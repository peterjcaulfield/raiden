function alpha(config) {

  return 'alpha';
}

function alphanum(config) {

  var sanitizedConfig = Object.assign({
    length: 10,
    prefix: '',
    suffix: ''
  }, config);

  return `${sanitizedConfig.prefix}foo100${sanitizedConfig.suffix}`;
}

function num(range) {
  return 100000;
}

function numstring(range) {
  return '200';
}


module.exports = {
  alpha,
  alphanum,
  num,
  numstring
}
