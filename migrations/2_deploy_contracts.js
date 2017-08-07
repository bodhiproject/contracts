let BodhiToken = artifacts.require("./BodhiToken.sol");
let config = require('../config/config')(web3);

module.exports = function(deployer) {
  deployer.deploy(
    BodhiToken, 
    config.startBlock,  // startBlock
    config.endBlock,  // endBlock 
    config.initialExchangeRate,  // initialExchangeRate
    config.decayPeriod,
    config.presaleAmount, // presaleAmount
    '0x12345'
  );
};
