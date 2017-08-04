let TestRPC = require('ethereumjs-testrpc');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      provider: TestRPC.provider(),
      network_id: "*"
    }
  }
};
