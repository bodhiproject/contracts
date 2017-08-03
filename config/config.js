function Config(web3) {
  return {
    startBlock: 10,
    endBlock: 50,
    initialExchangeRate: 100,
    presaleAmount: web3.toWei(20e6),
    wallet: web3.eth.coinbase
  }
};

module.exports = Config;