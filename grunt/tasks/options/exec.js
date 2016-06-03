module.exports = {
  wiremock_start: {
    cmd: './node_modules/pm2/bin/pm2 flush && ./node_modules/pm2/bin/pm2 start server/wiremock/pm2.json'
  },
  wiremock_stop: {
    cmd: './node_modules/pm2/bin/pm2 flush && ./node_modules/pm2/bin/pm2 delete all'
  },
  webpack_server_start: {
    cmd: 'webpack_dev_server'
  },
  webpack_server_stop: {
    cmd: ''
  }
}
