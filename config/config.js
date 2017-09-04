let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 30,
        endBlock: 60,
        initialExchangeRate: 100,
        presaleAmount: web3.toWei(30e6)
    }
};
module.exports = Config;