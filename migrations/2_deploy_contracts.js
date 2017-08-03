var BodhiToken = artifacts.require("./BodhiToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BodhiToken, 
    100,  // startBlock
    500,  // endBlock 
    100,  // initialExchangeRate
    web3.toWei(20e6), // presaleAmount
    web3.eth.coinbase); // wallet
};
