const BodhiToken = artifacts.require("./BodhiToken.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const config = require('../config/config')(web3);
const assert = require('chai').assert;
const bluebird = require('bluebird');

const requester = bluebird.promisifyAll(web3.eth);

/**
 * One of the tests requires high value accounts (containing 400k Ether).
 * Run the script 'testrpc_high_value.sh' to start TestRPC with 4 high value accounts.
 */
contract('BodhiToken', function(accounts) {
  const regexInvalidOpcode = /invalid opcode/;

  const blockHeightManager = new BlockHeightManager(web3);
  const validPurchaseBlock = (config.startBlock + config.endBlock) / 2;

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

      let decimals = await token.decimals();
      let maxTokenForSale = web3.toBigNumber(await token.saleAmount());
      let expectedSaleAmount = web3.toBigNumber(60e6 * Math.pow(10, decimals));
      assert.equal(maxTokenForSale.toString(), expectedSaleAmount.toString(), "Sale amount does not match.");

      let totalTokenSupply = web3.toBigNumber(await token.tokenTotalSupply());
      let expectedTotalTokenSupply = web3.toBigNumber(100e6 * Math.pow(10, decimals));
      assert.equal(totalTokenSupply.toString(), expectedTotalTokenSupply.toString(), "Total token supply does not match.");

      let totalSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = web3.toBigNumber(config.presaleAmount);
      assert.equal(totalSupply.toString(), expectedTotalSupply.toString());
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

  describe("Minting", () => {
    it('allows only the owner of the contract to mint reserved tokens', async () => {
      let token = await BodhiToken.deployed();

      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(initialSupply.toString(), presaleAmount.toString());

      let decimals = await token.decimals();
      let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
      await token.mintReservedTokens(mintedTokenAmount, {from: accounts[0]});

      let actualMintSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
      assert.equal(actualMintSupply.toString(), expectedTotalSupply.toString(), "Expected total supply does not match.");
    });

    it('does not allow an address other than the owner to mint reserved tokens', async () => {
      let token = await BodhiToken.deployed();

      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      try {
        let decimals = await token.decimals();
        let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
        await token.mintReservedTokens(mintedTokenAmount, {from: accounts[1]});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      let actualMintSupply = web3.toBigNumber(await token.totalSupply());
      assert.equal(actualMintSupply.toString(), initialSupply.toString(), "Expected total supply does not match.");
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
      assert.equal(balanceBefore.add(residualTokens).valueOf(), balanceAfter.valueOf());
    });

    it('allows owner to mint reserved tokens after the end block has been reached', async () => {
      let token = await BodhiToken.deployed();

      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      await blockHeightManager.mineTo(config.endBlock + 1);
      assert.isAbove(await requester.getBlockNumberAsync(), config.endBlock);

      let decimals = await token.decimals();
      let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
      await token.mintReservedTokens(mintedTokenAmount, {from: accounts[0]});

      let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
      assert.equal(actualTotalSupply.toString(), expectedTotalSupply.toString(), "Total supply does not match.");
    });

    it('allows minting if it does not exceed the total token supply', async () => {
      let token = await BodhiToken.deployed();

      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      let maxTokenSupply = await token.tokenTotalSupply();
      let maxMintAmount = maxTokenSupply.sub(initialSupply);
      await token.mintReservedTokens(maxMintAmount, {from: accounts[0]});

      let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = initialSupply.add(maxMintAmount);
      assert.equal(actualTotalSupply.toString(), expectedTotalSupply.toString(), "Expected total supply does not match.");
      assert.equal(actualTotalSupply.toString(), maxTokenSupply.toString(), "Token supply should equal total token supply.");
    });

    it('does not allow minting if it exceeds the total token supply', async () => {
      let token = await BodhiToken.deployed();

      let beforeTotalSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(beforeTotalSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      try {
        let maxTokenSupply = await token.tokenTotalSupply();
        let overflowAmount = maxTokenSupply.sub(beforeTotalSupply).add(1);
        await token.mintReservedTokens(overflowAmount, {from: accounts[0]});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      let afterTotalSupply = web3.toBigNumber(await token.totalSupply());
      assert.equal(afterTotalSupply.toString(), beforeTotalSupply.toString(), "Total supply does not match.");
    });
  });

  describe('Purchasing', () => {
    it('reject buying token before startBlock', async () => {
      let token = await BodhiToken.deployed();

      assert(await requester.getBlockNumberAsync() < config.startBlock, 
        'current block height should less than start block height');;

      let from = accounts[1];
      let value = web3.toWei(1);

      try {
        await token.buyTokens(from, {value: value});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('reject buying token after endBlock', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(config.endBlock + 10);
      assert.isAtLeast(await requester.getBlockNumberAsync(), config.endBlock);

      let from = accounts[1];
      let value = web3.toWei(1); 

      try {
        await token.buyTokens(from, {value: value});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('accept buying token between start and end block', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let from = accounts[1];
      let value = web3.toWei(1);
      await token.buyTokens(from, {value: value});
      
      let balance = web3.toBigNumber(await token.balanceOf(from));
      let decimals = await token.decimals();
      let expectedBalance = web3.toBigNumber(100 * Math.pow(10, decimals));
      assert.equal(balance.toString(), expectedBalance.toString());
    });

    it('reject zero value purchase', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let blockNumber = await requester.getBlockNumberAsync();
      assert.isAtMost(blockNumber, config.endBlock);
      assert.isAtLeast(blockNumber, config.startBlock);

      let from = accounts[1];
      let value = web3.toWei(0);

      try {
        await token.buyTokens(from, {value: value});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('uses the fallback function to buy tokens if buyToken() is not used', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let blockNumber = await requester.getBlockNumberAsync();
      assert.isAtLeast(blockNumber, config.startBlock);
      assert.isAtMost(blockNumber, config.endBlock);

      let from = accounts[1];
      let value = web3.toWei(0);

      try {
        await requester.sendTransactionAsync({
          to: token.address,
          from,
          value
        });
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('allows an address to buy tokens on behalf of a beneficiary', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let purchaser = accounts[1];
      let beneficiary = accounts[2];
      let value = web3.toWei(1);
      await token.buyTokens(beneficiary, {from: purchaser, value: value});
      
      let purchaserBalance = await token.balanceOf(purchaser);
      assert.equal(purchaserBalance.toNumber(), 0, "Purchaser balance should be 0.");

      let beneficiaryBalance = await token.balanceOf(beneficiary);
      let expectedBeneficiaryBalance = await token.getTokenExchangeAmount(value);
      assert.equal(beneficiaryBalance.toNumber(), expectedBeneficiaryBalance, "Beneficiary balance does not match.");
    });

    it('sends the balance to the correct address if the beneficiary is the purchaser', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let purchaser = accounts[1];
      let beneficiary = accounts[1];
      let value = web3.toWei(1);
      await token.buyTokens(beneficiary, {from: purchaser, value: value});

      let balance = await token.balanceOf(purchaser);
      let expectedBalance = await token.getTokenExchangeAmount(value);
      assert.equal(balance.toString(), expectedBalance.toString(), "Balance does not match.");
    });

    it('does not allow buying tokens once sale amount has been reached', async () => {
      let token = await BodhiToken.deployed();

      var totalSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount);
      assert.equal(totalSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      await blockHeightManager.mineTo(validPurchaseBlock);

      var purchaser = accounts[1];
      var value = web3.toWei(3e5, "ether");
      await token.buyTokens(purchaser, {from: purchaser, value: value});

      totalSupply = web3.toBigNumber(await token.totalSupply());
      let saleAmount = web3.toBigNumber(await token.saleAmount());
      assert.equal(totalSupply.toString(), saleAmount.toString(), "Total supply should equal sale amount.");

      purchaser = accounts[2];
      value = web3.toWei(1);

      try {
        await token.buyTokens(purchaser, {from: purchaser, value: value});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      totalSupply = web3.toBigNumber(await token.totalSupply());
      assert.equal(totalSupply.toString(), saleAmount.toString(), "Total supply should match sale amount.");
    });
  });

  describe('Forwarding Funds', () => {
    it('should forward funds to the owner', async () => {
      let token = await BodhiToken.deployed();
      let owner = await token.owner();
      let beforeTransferBalance = web3.toBigNumber(await requester.getBalanceAsync(owner));

      await blockHeightManager.mineTo(validPurchaseBlock);

      let from = accounts[1];
      let value = web3.toWei(1);
      await token.buyTokens(from, {from: from, value: value});

      let afterTransferBalance = web3.toBigNumber(await requester.getBalanceAsync(owner));
      let actualBalance = afterTransferBalance.sub(beforeTransferBalance);
      assert.equal(actualBalance.toString(), value.toString(), "Balances do not match.");
    });

    it('should revert all funds if transaction is failed', async () => {
      let token = await BodhiToken.deployed();
      let owner = await token.owner();
      let beforeBalance = await requester.getBalanceAsync(owner);

      await blockHeightManager.mineTo(config.startBlock - 5);

      let from = accounts[1];
      let value = web3.toWei(1);

      try {
        await token.buyTokens(from, {from: from, value: value});
        assert.fail();
      } catch(e) {
        assert.match(e.message, regexInvalidOpcode);
      }

      let afterBalance = await requester.getBalanceAsync(owner);
      assert.equal(beforeBalance.toString(), afterBalance.toString(), "Balances do not match.");
    });
  });

  describe('Exchange', () => {
    it('should return the correct exchange rate', async() => {
      let token = await BodhiToken.deployed();

      let exchangeTokenDecimals = await token.exchangeTokenDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, exchangeTokenDecimals);
      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei);

      let exchangeRate = await token.initialExchangeRate();
      let decimals = await token.decimals();
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange rate does not match.");
    });

    it('should throw on a zero exchange rate', async () => {
      let token = await BodhiToken.deployed();

      try {
        let amount = await token.getTokenExchangeAmount(0);
        assert.fail();
      } catch(e) {
        assert.match(e.message, regexInvalidOpcode);
      }
    });
  });
});
