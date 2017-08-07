let bluebird = require('bluebird');

function Config(web3) {
  return {
    startBlock: 30,
    endBlock: 60,
    initialExchangeRate: 100,
    decayPeriod: 20, // decay 10% every 20 blocks
    presaleAmount: web3.toWei(20e6),
   // wallet: await bluebird.promisify(web3.eth.getCoinbase)()
  }
};

module.exports = Config;