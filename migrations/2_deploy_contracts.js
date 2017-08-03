let BodhiToken = artifacts.require("./BodhiToken.sol");
let config = require('../config/config')(web3);

module.exports = function(deployer) {
  console.log(config);
  deployer.deploy(BodhiToken, 
    config.startBlock,  // startBlock
    config.endBlock,  // endBlock 
    config.initialExchangeRate,  // initialExchangeRate
    config.presaleAmount, // presaleAmount
    config.wallet); // wallet
};
