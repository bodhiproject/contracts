const BodhiToken = artifacts.require("./BodhiToken.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const config = require('../config/config')(web3);
const assert = require('chai').assert;
const bluebird = require('bluebird');

const requester = bluebird.promisifyAll(web3.eth);

contract('BodhiToken', function(accounts) {
  const blockHeightManager = new BlockHeightManager(web3);

  before(blockHeightManager.snapshot);
  afterEach(blockHeightManager.revert);

  it("should mint presale token and allocate to the wallet", async function() {
    let token = await BodhiToken.deployed();

    // Assert the presale allocation
    let balance = await token.balanceOf.call('0x12345');

    let balanceInEther = web3.fromWei(balance);
    // Set during the initialization, see "migrations/2_deploy_contracts.js"
    let expectedBalanceInEther = web3.toBigNumber(20e6);
    assert(balanceInEther.eq(expectedBalanceInEther), "wallet should have received presale token");

    // Assert the supply is updated
    let totalSupply = await token.totalSupply();
    let fundingStartBlock = await token.fundingStartBlock();
    console.log(totalSupply, fundingStartBlock);
  });

  it('initialized correctly', async () => {
    let token = await BodhiToken.deployed();

    let fundingStartBlock = await token.fundingStartBlock();
    let fundingEndBlock = await token.fundingEndBlock();

    assert(fundingStartBlock > 0);
    assert(fundingEndBlock > fundingStartBlock);
  });

  describe('exchange open period', () => {
    it.only('reject buying token before startBlock', async () => {
      let token = await BodhiToken.deployed();

      assert(await requester.getBlockNumberAsync() < config.startBlock, 
        'current block height should less than start block height');;


      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      try {
        await requester.sendTransactionAsync({
          to: token.address,
          from,
          value: 0
        });

        assert.fail();
      }
      catch(e) {
        assert.match(e.toString(), /invalid opcode/);
      }
    });

    it.only('reject buying token after endBlock', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(config.endBlock + 10);

      assert.isAtLeast(await requester.getBlockNumberAsync(), config.endBlock);

      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      try {
        await requester.sendTransactionAsync({
          to: token.address,
          from,
          value: 0
        });

        assert.fail();
      } catch(e) {
        assert.match(e.toString(), /invalid opcode/);
      }
    });

    it('accept buying token between start and end block', async () => {
      let token = await BodhiToken.deployed();

      let destBlock = parseInt((config.startBlock + config.endBlock) / 2);

      await blockHeightManager.mineTo(destBlock);


      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      console.log(await web3.eth.getBalance(from))

      let tx = web3.eth.sendTransaction({
        to: token.address,
        from,
        value
      });

      let balance = await token.balanceOf(from);

      assert.ok(balance.eq(web3.toWei(100)));
    })
  });

  describe('forward funds', () => {
    it('should foward funds to the wallet', async () => {
      let token = await BodhiToken.deployed();

      console.log(web3.eth.blockNumber) ;
    });
  });
});
