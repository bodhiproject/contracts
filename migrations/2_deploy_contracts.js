var BodhiToken = artifacts.require("./BodhiToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BodhiToken, 100, 500, web3.toWei(20e6), web3.eth.coinbase);
};
