var BotToken = artifacts.require("./BotToken.sol");

contract('BotToken', function(accounts) {
  it("should return 0 balance", function() {
    return BotToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "Should have 0 balance at the beginning");
    });
  });
});
