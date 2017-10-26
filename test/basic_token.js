const BasicToken = artifacts.require('./BasicToken.sol');
const assert = require('chai').assert;
const web3 = global.web3;

contract('BasicToken', function(accounts) {
    const owner = accounts[0];

    let instance;

    beforeEach(async function() {
        instance = await BasicToken.new({ from: owner });
    });

    describe('balanceOf', async function(){
        it("should assert true", async function(done) {
            assert.isTrue(true);
            done();
        });
    });
});
