let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 40,
        endBlock: 80,
        initialExchangeRate: 100,
        presaleAmount: 30e14 // 30e6 (BOT amount) * 10e8 (BOT factor)
    }
};
module.exports = Config;