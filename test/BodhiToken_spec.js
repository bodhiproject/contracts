var BodhiToken = artifacts.require("./BodhiToken.sol");

contract('BodhiToken', function(accounts) {
  it("should mint presale token and allocate to the wallet", async function() {
    let token = await BodhiToken.deployed();

    // Assert the presale allocation
    let balance = await token.balanceOf.call(accounts[0]);

    let balanceInEther = web3.fromWei(balance);
    // Set during the initialization, see "migrations/2_deploy_contracts.js"
    let expectedBalanceInEther = web3.toBigNumber(20e6);

    assert(balanceInEther.eq(expectedBalanceInEther), "wallet should have received presale token");

    // Assert the supply is updated
    let totalSupply = await token.totalSupply.call();
    let fundingStartBlock = await token.fundingStartBlock.call();
    console.log(totalSupply, fundingStartBlock);

    // Mint should be also capped
    let ret = await token.mint(accounts[1], web3.toWei(2000e6));
    balance = await token.balanceOf.call(accounts[1]);
    totalSupply = await token.totalSupply.call();
    console.log(ret.logs[0].args, totalSupply, balance);
  });
});
