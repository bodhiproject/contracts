const BodhiToken = artifacts.require("./BodhiToken.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const Utils = require('./helpers/utils');
const assert = require('chai').assert;
const bluebird = require('bluebird');

contract('BodhiToken', function(accounts) {
  const blockHeightManager = new BlockHeightManager(web3);
  const regexInvalidOpcode = /invalid opcode/;
  const owner = accounts[0];

  let token;
  let decimals;

  before(blockHeightManager.snapshot);
  afterEach(blockHeightManager.revert);

  beforeEach(async function() {
    token = await BodhiToken.deployed({ from: owner });
    decimals = await token.decimals.call();
  })

  describe("Initialization", async function() {
    it('initializes all the values', async function() {
      let tokenTotalSupply = await token.tokenTotalSupply.call(); 
      let expectedTokenTotalSupply = Utils.getBigNumberWithDecimals(100e6, decimals);
      assert.equal(tokenTotalSupply.toString(), expectedTokenTotalSupply.toString(), "tokenTotalSupply does not match");
    });
  });

  describe("mint", () => {
    it('allows only the owner to mint tokens', async () => {
      var totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), 0, "Initial totalSupply should be 0");

      let tokenTotalSupply = await token.tokenTotalSupply.call(); 
      await token.mint(owner, tokenTotalSupply, {from: owner });

      totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), tokenTotalSupply.toString(), "totalSupply should equal tokenTotalSupply");
    });

    it('does not allow an address other than the owner to mint tokens', async () => {
      var totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), 0, "totalSupply should be 0");
      
      try {
        await token.mint(accounts[1], 1, { from: accounts[1] });
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      try {
        await token.mint(accounts[2], 1, { from: accounts[2] });
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), 0, "totalSupply should be 0");
    });

    it('throws if trying to mint more than the tokenTotalSupply', async () => {
      var totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), 0, "totalSupply should be 0");

      let tokenTotalSupply = await token.tokenTotalSupply.call(); 
      await token.mint(owner, tokenTotalSupply, {from: owner });

      totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), tokenTotalSupply.toString(), "totalSupply should equal tokenTotalSupply");

      try {
        await token.mint(owner, 1, { from: owner });
        assert.fail();
      } catch(e) {
        assert.match(e.toString(), regexInvalidOpcode);
      }

      totalSupply = await token.totalSupply.call();
      assert.equal(totalSupply.toString(), tokenTotalSupply.toString(), "totalSupply should equal tokenTotalSupply");
    });
  });
});
