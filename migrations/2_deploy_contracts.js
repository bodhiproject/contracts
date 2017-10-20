let BodhiToken = artifacts.require("./tokens/BodhiToken.sol");
let CrowdsaleBodhiToken = artifacts.require("./tokens/CrowdsaleBodhiToken.sol");
let config = require('../config/config')(web3);

module.exports = function(deployer) {
    deployer.deploy(BodhiToken);
    deployer.deploy(CrowdsaleBodhiToken, config.startBlock, config.endBlock, config.initialExchangeRate,
        config.presaleAmount);
};
