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

    describe('transferFrom', async function() {
        it('should allow transferring the allowed amount', async function() {
            var ownerBalance = tokenParams._initialBalance;

            let acct1Allowance = 1000;
            await instance.approve(accounts[1], acct1Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[1]), acct1Allowance, 
                'accounts[1] allowance does not match approved amount');

            await instance.transferFrom(owner, accounts[1], acct1Allowance, { from: accounts[1] });
            assert.equal(await instance.balanceOf(accounts[1]), acct1Allowance, 'accounts[1] balance does not match');

            ownerBalance = ownerBalance - acct1Allowance;
            assert.equal(await instance.balanceOf(owner), ownerBalance, 
                'owner balance does not match after first transfer');

            let acct2Allowance = 3000;
            await instance.approve(accounts[2], acct2Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[2]), acct2Allowance, 
                'accounts[2] allowance does not match approved amount');

            await instance.transferFrom(owner, accounts[2], acct2Allowance, { from: accounts[2] });
            assert.equal(await instance.balanceOf(accounts[2]), acct2Allowance, 'accounts[2] balance does not match');

            ownerBalance = ownerBalance - acct2Allowance;
            assert.equal(await instance.balanceOf(owner), ownerBalance, 
                'owner balance does not match after second transfer');
        });
    });

    describe('approve', async function() {
        it('should allow approving', async function() {
            let acct1Allowance = 1000;
            await instance.approve(accounts[1], acct1Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[1]), acct1Allowance, 
                'accounts[1] allowance does not match approved amount');

            let acct2Allowance = 3000;
            await instance.approve(accounts[2], acct2Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[2]), acct2Allowance, 
                'accounts[2] allowance does not match approved amount');
        });

        it('should throw if the value is not 0 and has previous approval', async function() {
            let acct1Allowance = 1000;
            await instance.approve(accounts[1], acct1Allowance, { from: owner });
            assert.equal(await instance.allowance(owner, accounts[1]), acct1Allowance, 
                'accounts[1] allowance does not match approved amount');

            try {
                await instance.approve(accounts[1], 123, { from: owner });
            } catch(e) {
                assert.match(e.message, /invalid opcode/);
            }
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

            assert.equal(await instance.allowance(owner, accounts[3]), 0, 'accounts[3] allowance does not match');
        });
    });
});
