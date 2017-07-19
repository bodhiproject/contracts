var BodhiToken = artifacts.require("./BodhiToken.sol");

contract('BodhiToken', function(accounts) {
  it("should return 0 balance", function() {
    return BodhiToken.deployed().then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 0, "Should have 0 balance at the beginning");
    });
  });
});
