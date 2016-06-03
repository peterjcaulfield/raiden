module.exports = {
  test: {
    options: {
      reporter: 'nyan',
      require: 'babel-register'
    },
    src: ['tests/unit/**/*.js']
  }
}
