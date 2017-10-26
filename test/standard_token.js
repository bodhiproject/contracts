const StandardTokenMock = artifacts.require('./mocks/StandardTokenMock.sol');
const assert = require('chai').assert;
const web3 = global.web3;

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

    it("should assert true", function(done) {
        assert.isTrue(true);
    });
});
