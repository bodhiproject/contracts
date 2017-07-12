var ConvertLib = artifacts.require("./ConvertLib.sol");
var BotToken = artifacts.require("./BotToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, BotToken);
  deployer.deploy(BotToken);
};
