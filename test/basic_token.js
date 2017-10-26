const BasicTokenMock = artifacts.require('./mocks/BasicTokenMock.sol');
const assert = require('chai').assert;
const web3 = global.web3;

contract('BasicToken', function(accounts) {
    const owner = accounts[0];
    const tokenParams = {
        _initialAccount: owner,
        _initialBalance: 10000000
    };

    let instance;

    beforeEach(async function() {
        instance = await BasicTokenMock.new(...Object.values(tokenParams), { from: owner });
    });

    describe('balanceOf', async function(){
        it('should return the right balance', async function() {
            assert.equal(await instance.balanceOf(owner, { from: owner }), tokenParams._initialBalance, 
                'owner balance does not match');
            assert.equal(await instance.balanceOf(accounts[1], { from: accounts[1] }), 0, 
                'accounts[1] balance should be 0');
            assert.equal(await instance.balanceOf(accounts[2], { from: accounts[2] }), 0, 
                'accounts[2] balance should be 0');
        });
    });
});
