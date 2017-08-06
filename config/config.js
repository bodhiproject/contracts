let bluebird = require('bluebird');

function Config(web3) {
  return {
    startBlock: 10,
    endBlock: 50,
    initialExchangeRate: 100,
    presaleAmount: web3.toWei(20e6),
   // wallet: await bluebird.promisify(web3.eth.getCoinbase)()
  }
};

module.exports = Config;