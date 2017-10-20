function getBigNumberWithDecimals(amount, numOfDecimals) {
    return web3.toBigNumber(amount * Math.pow(10, numOfDecimals));
}

Object.assign(exports, {
    getBigNumberWithDecimals,
});
