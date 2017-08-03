const BodhiToken = artifacts.require("./BodhiToken.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const config = require('../config/config')(web3);

contract('BodhiToken', function(accounts) {
  const blockHeightManager = new BlockHeightManager(web3);

  afterEach('revert', blockHeightManager.revert);

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

  describe('exchange open period', () => {
    it('reject buying token before startBlock', async () => {
      let token = await BodhiToken.deployed();
      console.log('Token fundingStartBlock', 
        await token.fundingStartBlock());

      console.log('Token saleAmount', 
        await token.saleAmount());

      assert(web3.eth.blockNumber < config.startBlock, 
        'current block height should less than start block height');;


      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      console.log('Before', web3.eth.getBalance(from));

      try {
        let txHash = await web3.eth.sendTransaction({
          to: token.address,
          from,
          value: 0
        });
      } catch(e) {
        console.log(e);
      }

      // let ret = await web3.eth.getTransactionReceipt(txHash);
      // console.log(ret);
// 
      // ret = await web3.eth.getTransaction(txHash);
      // console.log(ret);
// 
      // console.log('After', web3.eth.getBalance(from));
    });
  });

  describe('forward funds', () => {
    it('should foward funds to the wallet', async () => {
      let token = await BodhiToken.deployed();

      console.log(web3.eth.blockNumber) ;
    });
  });
});
