let BodhiToken = artifacts.require("./tokens/BodhiToken.sol");

module.exports = function(deployer) {
    deployer.deploy(BodhiToken);
};
