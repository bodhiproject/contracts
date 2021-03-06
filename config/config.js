let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 40,
        endBlock: 80,
        initialExchangeRate: 100,
        presaleAmount: 30e6 // 30 million presale tokens
    }
};
module.exports = Config;