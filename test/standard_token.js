const StandardTokenMock = artifacts.require('./mocks/StandardTokenMock.sol');
const assert = require('chai').assert;

contract('StandardToken', function(accounts) {
    const owner = accounts[0];
    const tokenParams = {
        _initialAccount: owner,
        _initialBalance: 10000000
    };

    let instance;

    beforeEach(async function() {
        instance = await StandardTokenMock.new(...Object.values(tokenParams), { from: owner });
    });

    describe('constructor', async function() {
        it('should initialize all the values correctly', async function() {
            assert.equal(await instance.balanceOf(owner, { from: owner }), tokenParams._initialBalance, 
                'owner balance does not match');
            assert.equal(await instance.totalSupply.call(), tokenParams._initialBalance, 'totalSupply does not match');
        });
    });

    describe('allowance', async function() {
        it('should return the right allowance', async function() {
            let acct1Allowance = 1000;
            await instance.approve(accounts[1], acct1Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[1]), acct1Allowance, 
                'accounts[1] allowance does not match');

            let acct2Allowance = 3000;
            await instance.approve(accounts[2], acct2Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[2]), acct2Allowance, 
                'accounts[2] allowance does not match');
        });
    });
});
