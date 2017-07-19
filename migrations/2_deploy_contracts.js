var ConvertLib = artifacts.require("./ConvertLib.sol");
var BodhiToken = artifacts.require("./BodhiToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, BodhiToken);
  deployer.deploy(BodhiToken);
};
