let BodhiToken = artifacts.require("./BodhiToken.sol");

module.exports = function(deployer) {
    deployer.deploy(BodhiToken);
};
