const BodhiToken = artifacts.require("./BodhiToken.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const Utils = require('./helpers/utils');
const config = require('../config/config')(web3);
const assert = require('chai').assert;
const bluebird = require('bluebird');

const requester = bluebird.promisifyAll(web3.eth);

/**
 * One of the tests requires high value accounts (containing 400k Ether).
 * Run the script 'testrpc_high_value.sh' to start TestRPC with 4 high value accounts.
 */
contract('BodhiToken', function(accounts) {
  const blockHeightManager = new BlockHeightManager(web3);
  const regexInvalidOpcode = /invalid opcode/;
  const validPurchaseBlock = (config.startBlock + config.endBlock) / 2;
  const owner = accounts[0];

  let token;

  before(blockHeightManager.snapshot);
  afterEach(blockHeightManager.revert);

  beforeEach(async function() {
    token = await BodhiToken.deployed({ from: owner });
  })

  describe("Initialization", async function() {
    it('initializes all the values', async function() {
      let decimals = await token.decimals.call();

      let totalSupply = await token.totalSupply.call(); 
      let expectedTotalSupply = Utils.getBigNumberWithDecimals(40e6, decimals);
      assert.equal(totalSupply.toString(), expectedTotalSupply.toString(), "totalSupply does not match");

      let saleAmount = await token.saleAmount();
      let expectedSaleAmount = Utils.getBigNumberWithDecimals(60e6, decimals);
      assert.equal(saleAmount.toString(), expectedSaleAmount.toString(), "Sale amount does not match");

      let exchangeRate = await token.exchangeRate();
      let expectedExchangeRate = 100;
      assert.equal(exchangeRate.toString(), expectedExchangeRate.toString(), "exchangeRate does not match");
    });

    it("should mint reserve tokens to the owner", async function() {
      let decimals = await token.decimals();

      let ownerBalance = await token.balanceOf(owner);
      let expectedBalance = Utils.getBigNumberWithDecimals(40e6, decimals);
      assert.equal(ownerBalance.toString(), expectedBalance.toString(), "ownerBalance does not match reserve amount");

      let totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), expectedBalance.toString(), "totalSupply does not match the reserve amount");
    });
  });

  describe("Minting", () => {
    it('allows only the owner of the contract to mint reserved tokens', async () => {
      let token = await BodhiToken.deployed();

      let decimals = await token.decimals();
      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
      assert.equal(initialSupply.toString(), presaleAmount.toString());

      let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
      await token.mintReservedTokens(mintedTokenAmount, {from: accounts[0]});

      let actualMintSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
      assert.equal(actualMintSupply.toString(), expectedTotalSupply.toString(), "Expected total supply does not match.");
    });

    it('does not allow an address other than the owner to mint reserved tokens', async () => {
      let token = await BodhiToken.deployed();

      let decimals = await token.decimals();
      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
      assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      try {
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

      let decimals = await token.decimals();
      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
      assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      await blockHeightManager.mineTo(config.endBlock + 1);
      assert.isAbove(await requester.getBlockNumberAsync(), config.endBlock);

      let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
      await token.mintReservedTokens(mintedTokenAmount, {from: accounts[0]});

      let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
      let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
      assert.equal(actualTotalSupply.toString(), expectedTotalSupply.toString(), "Total supply does not match.");
    });

    it('allows minting if it does not exceed the total token supply', async () => {
      let token = await BodhiToken.deployed();

      let decimals = await token.decimals();
      let initialSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
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

      let decimals = await token.decimals();
      let beforeTotalSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
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

      try {
        let from = accounts[1];
        let nativeDecimals = await token.nativeDecimals();
        let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

        await token.buyTokens(from, {value: exchangeTokenWei});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('reject buying token after endBlock', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(config.endBlock + 10);
      assert.isAtLeast(await requester.getBlockNumberAsync(), config.endBlock);

      try {
        let from = accounts[1];
        let nativeDecimals = await token.nativeDecimals();
        let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

        await token.buyTokens(from, {value: exchangeTokenWei});
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }
    });

    it('accept buying token between start and end block', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let from = accounts[1];
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
      await token.buyTokens(from, {value: exchangeTokenWei});
      
      let actualBalance = web3.toBigNumber(await token.balanceOf(from));
      let exchangeRate = await token.initialExchangeRate();
      let decimals = await token.decimals();
      let expectedBalance = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualBalance.toString(), expectedBalance.toString());
    });

    it('reject zero value purchase', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let blockNumber = await requester.getBlockNumberAsync();
      assert.isAtMost(blockNumber, config.endBlock);
      assert.isAtLeast(blockNumber, config.startBlock);

      try {
        let from = accounts[1];
        let value = 0;

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
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      await requester.sendTransactionAsync({
        to: token.address,
        from: from,
        value: exchangeTokenWei
      });

      let actualBalance = web3.toBigNumber(await token.balanceOf(from));
      let exchangeRate = await token.initialExchangeRate();
      let decimals = await token.decimals();
      let expectedBalance = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualBalance.toString(), expectedBalance.toString());
    });

    it('allows an address to buy tokens on behalf of a beneficiary', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let purchaser = accounts[1];
      let beneficiary = accounts[2];
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
      await token.buyTokens(beneficiary, {from: purchaser, value: exchangeTokenWei});
      
      let purchaserBalance = await token.balanceOf(purchaser);
      assert.equal(purchaserBalance.toNumber(), 0, "Purchaser balance should be 0.");

      let beneficiaryBalance = await token.balanceOf(beneficiary);
      let decimals = await token.decimals();
      let exchangeRate = await token.initialExchangeRate();
      let expectedBeneficiaryBalance = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      assert.equal(beneficiaryBalance.toString(), expectedBeneficiaryBalance.toString(), "Beneficiary balance does not match.");
    });

    it('sends the balance to the correct address if the beneficiary is the purchaser', async () => {
      let token = await BodhiToken.deployed();

      await blockHeightManager.mineTo(validPurchaseBlock);

      let purchaser = accounts[1];
      let beneficiary = accounts[1];
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
      await token.buyTokens(beneficiary, {from: purchaser, value: exchangeTokenWei});

      let balance = await token.balanceOf(purchaser);
      let decimals = await token.decimals();
      let exchangeRate = await token.initialExchangeRate();
      let expectedBalance = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      assert.equal(balance.toString(), expectedBalance.toString(), "Balance does not match.");
    });

    it('does not allow buying tokens once sale amount has been reached', async () => {
      let token = await BodhiToken.deployed();

      let decimals = await token.decimals();
      var totalSupply = web3.toBigNumber(await token.totalSupply());
      let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
      assert.equal(totalSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

      await blockHeightManager.mineTo(validPurchaseBlock);

      // Determine max number of tokens to purchase
      // 60e14 (total) - 30e14 (presale) = 30e14 (for purchase)
      let saleAmount = web3.toBigNumber(await token.saleAmount());
      let maxPurchaseTokens = saleAmount - presaleAmount;

      // Reverse the logic for getTokenExchangeAmount()
      let exchangeRate = await token.initialExchangeRate();
      let nativeDecimals = await token.nativeDecimals();
      let differenceFactor = Math.pow(10, nativeDecimals) / Math.pow(10, decimals);
      var exchangeTokenWei = maxPurchaseTokens / exchangeRate * differenceFactor;

      var purchaser = accounts[1];
      await token.buyTokens(purchaser, {from: purchaser, value: exchangeTokenWei});

      totalSupply = web3.toBigNumber(await token.totalSupply());
      assert.equal(totalSupply.toString(), saleAmount.toString(), "Total supply should equal sale amount.");

      purchaser = accounts[2];
      exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      try {
        await token.buyTokens(purchaser, {from: purchaser, value: exchangeTokenWei});
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
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
      await token.buyTokens(from, {from: from, value: exchangeTokenWei});

      let afterTransferBalance = web3.toBigNumber(await requester.getBalanceAsync(owner));
      let actualBalance = afterTransferBalance.sub(beforeTransferBalance);
      assert.equal(actualBalance.toString(), exchangeTokenWei.toString(), "Balances do not match.");
    });

    it('should revert all funds if transaction is failed', async () => {
      let token = await BodhiToken.deployed();
      let owner = await token.owner();
      let beforeBalance = await requester.getBalanceAsync(owner);

      await blockHeightManager.mineTo(config.startBlock - 5);

      let from = accounts[1];
      let nativeDecimals = await token.nativeDecimals();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      try {
        await token.buyTokens(from, {from: from, value: exchangeTokenWei});
        assert.fail();
      } catch(e) {
        assert.match(e.message, regexInvalidOpcode);
      }

      let afterBalance = await requester.getBalanceAsync(owner);
      assert.equal(beforeBalance.toString(), afterBalance.toString(), "Balances do not match.");
    });
  });

  describe('Exchange', () => {
    it('returns the correct exchange amount using the contract defined values', async() => {
      let token = await BodhiToken.deployed();

      let nativeDecimals = await token.nativeDecimals();
      let decimals = await token.decimals();
      let exchangeRate = await token.initialExchangeRate();
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);

      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 100 exchangeRate, 8 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 100;
      let nativeDecimals = 8;
      let decimals = 8;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 36 exchangeRate, 8 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 8;
      let decimals = 8;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 123 nativeTokens, 36 exchangeRate, 8 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 8;
      let decimals = 8;
      let exchangeTokenWei = 123 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(123 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 100 exchangeRate, 18 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 100;
      let nativeDecimals = 18;
      let decimals = 8;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 36 exchangeRate, 18 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 18;
      let decimals = 8;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 123 nativeToken, 36 exchangeRate, 18 nativeDecimals, 8 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 18;
      let decimals = 8;
      let exchangeTokenWei = 123 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(123 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 100 exchangeRate, 18 nativeDecimals, 18 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 100;
      let nativeDecimals = 18;
      let decimals = 18;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 1 nativeToken, 36 exchangeRate, 18 nativeDecimals, 18 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 18;
      let decimals = 18;
      let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('returns the correct exchange amount for 123 nativeToken, 36 exchangeRate, 18 nativeDecimals, 18 decimals', async() => {
      let token = await BodhiToken.deployed();

      let exchangeRate = 36;
      let nativeDecimals = 18;
      let decimals = 18;
      let exchangeTokenWei = 123 * Math.pow(10, nativeDecimals);

      let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
      let expectedAmount = web3.toBigNumber(123 * exchangeRate * Math.pow(10, decimals));
      assert.equal(actualAmount.toString(), expectedAmount.toString(), "Exchange amount does not match.");
    });

    it('should throw on a zero exchange amount', async () => {
      let token = await BodhiToken.deployed();

      try {
        let nativeDecimals = await token.nativeDecimals();
        let decimals = await token.decimals();
        let exchangeRate = await token.initialExchangeRate();
        let amount = await token.getTokenExchangeAmount(0, exchangeRate, nativeDecimals, decimals);
        assert.fail();
      } catch(e) {
        assert.match(e.message, regexInvalidOpcode);
      }
    });
  });
});
