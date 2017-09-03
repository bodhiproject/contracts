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

  describe("Initialization", () => {
    it('initializes all the values', async () => {
      let token = await BodhiToken.deployed();

      let fundingStartBlock = await token.fundingStartBlock();
      assert.equal(fundingStartBlock, config.startBlock, "Funding start block does not match.");

      let fundingEndBlock = await token.fundingEndBlock();
      assert.equal(fundingEndBlock, config.endBlock, "Funding end block does not match.");

      assert(fundingEndBlock > fundingStartBlock, "Funding end block is before funding start block.");
      assert.equal(await token.initialExchangeRate(), config.initialExchangeRate, "Initial exchange rate does not match.");

      let maxTokenForSale = web3.toBigNumber(await token.saleAmount());
      let expectedSaleAmount = web3.toBigNumber(web3.toWei(60e6, "ether"));
      assert.equal(maxTokenForSale.toString(), expectedSaleAmount.toString(), "Sale amount does not match.");

      let totalSupply = web3.toBigNumber(await token.tokenTotalSupply());
      let expectedTotalSupply = web3.toBigNumber(web3.toWei(100e6, "ether"));
      assert.equal(totalSupply.toString(), expectedTotalSupply.toString(), "Total token supply does not match.");
    });

    it("should mint presale token and allocate to the owner", async function() {
      let token = await BodhiToken.deployed();

      // Assert the presale allocation
      let owner = await token.owner();
      let ownerBalance = await token.balanceOf(owner);
      let expectedPresaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(ownerBalance.toString(), expectedPresaleAmount.toString(), "Owner balance does not match presale amount.");

      // Assert the supply is updated
      let totalSupply = await token.totalSupply();
      assert.equal(totalSupply.toString(), expectedPresaleAmount.toString(), "Total supply does not match the presale amount.");
    });
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
    it('should forward funds to the owner', async () => {
      let token = await BodhiToken.deployed();
      let owner = await token.owner();

      // Initial balance of the owner
      let initialBalance = await requester.getBalanceAsync(owner);

      await blockHeightManager.mineTo(config.startBlock + 1);

      let from = accounts[1]; // Using the second account to purchase BOT
      let value = web3.toWei(1); // Buy 1 ETH worth of BOT

      await requester.sendTransactionAsync({
        to: token.address,
        from,
        value
      });

      ownerBalance = await requester.getBalanceAsync(owner);
      assert.equal(ownerBalance - initialBalance, value);
    });

    it('should revert all funds if transaction is failed', async () => {
      let token = await BodhiToken.deployed();
      let owner = await token.owner();

      var ownerBalance = await requester.getBalanceAsync(owner);
      assert.equal(ownerBalance, 0, "Owner balance should be 0.");

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

      ownerBalance = await requester.getBalanceAsync(owner);
      assert(ownerBalance.valueOf(), 0);
    });
  });

  describe('exchange', () => {
    it('should return the correct exchange rate', async() => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(config.startBlock);
      let startingExchangeRate = await token.exchangeTokenAmount(1);
      assert.equal(startingExchangeRate.toNumber(), 100);

      await blockHeightManager.mineTo(config.startBlock + 1)
      let firstDecayExchangeRate = await token.exchangeTokenAmount(1);
      assert.equal(firstDecayExchangeRate.toNumber(), 100);
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

  it('should be able to mint the reserved portion to the owner', async() => {
    let token = await BodhiToken.deployed();
    let totalSupply = await token.totalSupply();
    let owner = await token.owner();
    let maxTokenSupply = await token.tokenTotalSupply();

    let balanceBefore = await token.balanceOf(owner);
    let residualTokens = maxTokenSupply.sub(totalSupply);

    await token.mintReservedTokens(residualTokens);

    let balanceAfter = await token.balanceOf(owner);

    assert.equal(
      balanceBefore.add(residualTokens).valueOf(), 
      balanceAfter.valueOf()
    );
  });

  it('forbids minting more than token total supply', async() => {
    let token = await BodhiToken.deployed();
    let totalSupply = await token.totalSupply();
    let owner = await token.owner();
    let maxTokenSupply = await token.tokenTotalSupply();

    let balanceBefore = await token.balanceOf(owner);
    // One more BOT above the limit
    let overflowAmount = maxTokenSupply.sub(totalSupply).add(1);

    try {
      await token.mintReservedTokens(overflowAmount);
      assert.fail();
    }
    catch(e) {
      assert.match(e.message, /invalid opcode/);
    }
  });
});