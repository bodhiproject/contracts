# Bodhi Token and CrowdSale Contracts [![Build Status](https://travis-ci.com/bodhiproject/contracts.svg?token=yhzSGYVKSykUrXc4FYC8&branch=master)](https://travis-ci.com/bodhiproject/contracts)

## How to Setup Environment?

### Nodejs(tests use `async/await`, v7.0 at least):

    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
    $ nvm install 7
    $ nvm use 7
    
### Yarn:
 
[Installation | Yarn](https://yarnpkg.com/en/docs/install)

### Pull the codebase:

    $ git clone git@github.com:bodhiproject/contracts.git
    $ cd contracts
    
### Install dependencies(mostly for the development):

    $ yarn global add truffle
    $ yarn install
    
## Toolchain

* __yarn__: package management
* __truffle__: contract development environment
* __chai__: enhanced assertion library 
* __mocha__(included in truffle): test framework(provides DSL like `decsribe`, `it`, `beforeEach` etc.)
* __ethereum-testrpc__: evm and blockchain simulator

## Test

    $ npm test

## Deployment

### Production
TODO: figure out how contract deployment in QTUM works.

### Development in Ethereum

    $ parity --chain kovan
    $ truffle migrate
    
Remember to sign transactions in the Parity signer from the UI.

### Deployment on Kovan Testnet
1. Add `kovan` to networks array in `truffle.js`:
```
let TestRPC = require('ethereumjs-testrpc');

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    test: {
      provider: TestRPC.provider(),
      network_id: "*"
    },
    /* 
        ADD THIS CODE:
        Please note I change the port number of Parity 
        because it was interferring with TestRPC's port (8545).
        You need to edit the config.toml for Parity to match this.
    */
    kovan: {
      host: 'localhost',
      port: 8547,
      network_id: '42'
    }
  }
};
```
2. Make sure Parity is running on the kovan chain: `parity --chain=kovan`
3. Edit the `config.js` as necessary. Here was my values that I used:
```
function Config(web3) {
  return {
    startBlock: 3530000,
    endBlock: 3630000,
    initialExchangeRate: 10000000,
    decayPeriod: 100, // decay 10% every 20 blocks
    presaleAmount: web3.toWei(30e6),
    wallet: "0x001713695891806EA2FD001F406fa0Ce96e8467F" // This wallet should be your Kovan Testnet wallet address
  }
};
```
4. Make sure you have your Parity console open: `http://127.0.0.1:8180/`
5. `truffle compile`
6. `truffle migrate --reset --network=kovan`
7. You will get notifications in your Parity console to approve the transactions.
   I had 3 transactions I had to approve/enter password.
8. Here was the output on the command line:
```
Running migration: 1_initial_migration.js
  Deploying Migrations...
oh   ... 0xbf65c2e47dfc0908139fc342d4e716e6ce43d8e14efaccf76eb58e4652a0eccd
  Migrations: 0xbfdb9a8ab645044b8961fe88d455befce6ea8379
Saving successful migration to network...
  ... 0x26047ba497aee425259d09ca7df0c7d6086db67fb96dbc198a8e24c51382bbd8
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying BodhiToken...
  ... 0x7fd8aa4a6b4104d105463cefbb730fe6647f2272d82f0ecf283705e573daef26
Error encountered, bailing. Network state unknown. Review successful transactions manually.
Error: The contract code couldn't be stored, please check your gas amount.
    at Object.callback (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:222830:46)
    at /usr/local/lib/node_modules/truffle/build/cli.bundled.js:35149:25
    at /usr/local/lib/node_modules/truffle/build/cli.bundled.js:224768:9
    at /usr/local/lib/node_modules/truffle/build/cli.bundled.js:66971:11
    at /usr/local/lib/node_modules/truffle/build/cli.bundled.js:208348:9
    at XMLHttpRequest.request.onreadystatechange (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:209773:13)
    at XMLHttpRequestEventTarget.dispatchEvent (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:67130:18)
    at XMLHttpRequest._setReadyState (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:67420:12)
    at XMLHttpRequest._onHttpResponseEnd (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:67575:12)
    at IncomingMessage.<anonymous> (/usr/local/lib/node_modules/truffle/build/cli.bundled.js:67535:24)
    at emitNone (events.js:110:20)
    at IncomingMessage.emit (events.js:207:7)
    at endReadableNT (_stream_readable.js:1059:12)
    at _combinedTickCallback (internal/process/next_tick.js:138:11)
    at process._tickCallback (internal/process/next_tick.js:180:9)
```
*** Please note there was an error (I chatted with someone on Gitter and he had the exact same issue), but the contract looks like it deployed correctly.

9. In the `Signer` tab of `Parity` console you can see the accepted transactions. The 3rd one was the token contract, which you can click on and see the transaction in `etherscan`.
    
## TODOs
1. Deploy the contract to QTUM testnet. 
2. Document the deployment procedure.

## License
MIT
