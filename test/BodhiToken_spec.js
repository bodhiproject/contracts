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
    it('reject buying token before startBlock', async () => {
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

    it('reject buying token after endBlock', async () => {
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

      await requester.sendTransactionAsync({
        to: token.address,
        from,
        value
      });

      let balance = await token.balanceOf(from);

      assert.equal(balance.toNumber(), web3.toWei(100));
    });

    it('reject zero value purchase', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo((config.startBlock + config.endBlock) / 2);

      let blockNumber = await requester.getBlockNumberAsync();

      // Between the valid period
      assert.isAtMost(blockNumber, config.endBlock);
      assert.isAtLeast(blockNumber, config.startBlock);

      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(0);

      try {
        await requester.sendTransactionAsync({
          to: token.address,
          from,
          value
        });

        assert.fail();
      } catch(e) {
        assert.match(e.toString(), /invalid opcode/);
      }
    });
  });

  describe('forward funds', () => {
    it('should forward funds to the wallet', async () => {
      let token = await BodhiToken.deployed();
      let wallet = await token.wallet();

      // Initial balance of the wallet
      let walletBalance = await requester.getBalanceAsync(wallet);

      assert.equal(walletBalance.valueOf(), 0);

      await blockHeightManager.mineTo(config.startBlock + 1);

      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      await requester.sendTransactionAsync({
        to: token.address,
        from,
        value
      });

      walletBalance = await requester.getBalanceAsync(wallet);
      assert(walletBalance.eq(value));
    });

    it('should revert all funds if transaction is failed', async () => {
      let token = await BodhiToken.deployed();
      let wallet = await token.wallet();

      let walletBalance = await requester.getBalanceAsync(wallet);

      // Not start yet, it's required to be less than 
      // 5 transactions from now on
      await blockHeightManager.mineTo(config.startBlock - 5);

      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      try {
        await requester.sendTransactionAsync({
          to: token.address,
          from,
          value
        });

        assert.fail();
      } 
      catch(e) {
        assert.match(e.message, /invalid opcode/);
      }


      walletBalance = await requester.getBalanceAsync(wallet);
      assert(walletBalance.valueOf(), 0);
    });
  });

  describe('decayPeriod', () => {

    it('should be positive', async () => {
      try {
        let token = await BodhiToken.new(
          10,
          50,
          10,
          -10, // negative decayPeriod is forbidden
          20,
          accounts[1]
        );

        assert.fail();
      }
      catch(e) {
        assert.match(e.message, /invalid opcode/);
      }
    });


    it('should less than the open period', async () => {
      try {
        let token = await BodhiToken.new(
          10,
          50,
          10,
          100, // 100 > 50(endBlock) - 10(startBlock)
          20,
          accounts[1]
        );

        assert.fail();
      }
      catch(e) {
        assert.match(e.message, /invalid opcode/);
      }
    });

    it('should return the correct exchange rate', async() => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(config.startBlock);
      let startingExchangeRate = await token.exchangeTokenAmount(1);
      assert.equal(startingExchangeRate.toNumber(), 100);

      await blockHeightManager.mineTo(config.startBlock + config.decayPeriod + 1)
      let firstDecayExchangeRate = await token.exchangeTokenAmount(1);
      assert.equal(firstDecayExchangeRate.toNumber(), 90);
    });

    it('should forbid invalid rate for the exchange rate', async () => {
      let token = await BodhiToken.deployed();

      try {
        let rate = await token.exchangeTokenAmount(1);
        assert.fail();
      }
      catch(e) {
        assert.match(e.message, /invalid opcode/);
      }
    });

    it('should forbid negative for the exchange rate', async () => {
      let token = await BodhiToken.deployed();

      // Good to go
      await blockHeightManager.mineTo(config.startBlock);

      try {
        let rate = await token.exchangeTokenAmount(-1);
        assert.fail();
      }
      catch(e) {
        assert.match(e.message, /invalid opcode/);
      }
    });
  });

  it('should return the totalSupply', async () => {
    let token = await BodhiToken.deployed();
    let totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), config.presaleAmount);
  });
});
