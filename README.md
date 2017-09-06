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
    startBlock: 3584300,
    endBlock: 3605900,
    initialExchangeRate: 100,
    presaleAmount: web3.toWei(30e6)
  }
};
```
4. Make sure you have your Parity console open: `http://127.0.0.1:8180/`
5. `truffle compile`
6. `truffle migrate --reset --network=kovan`
7. You will get notifications in your Parity console to approve the transactions by entering your password. I had to do a total of 4 approvals before my contract was fully deployed.
8. Here was the output on the command line:
```
Using network 'kovan'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0x6c7c545bb3e4c22a74d32bacc3b56e08b71db80d06f7058c047bed6d5adb3fe4
  Migrations: 0xaafbe4d72858fa105ec886565d79d196e70fc396
Saving successful migration to network...
  ... 0xf2bae05225ab7e02106ea96f6525c8a5f4f9e2466af7849faf058233cde13539
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying BodhiToken...
  ... 0x1531244586220979c3fba5e94d0ff58194b1255196dc99874e63fd0bebdbeb7f
  BodhiToken: 0x94d94ee28e164ba0ba44ac03f208293d4196c73f
Saving successful migration to network...
  ... 0x7ed4922045102c65f16d109de4dd6ba1e21a84774313b9403c3bc4d923af9806
Saving artifacts...
```

9. In the `Signer` tab of `Parity` console you can see the accepted transactions. You can click on the address to see the transaction in `etherscan`.
    
## TODOs
1. Deploy the contract to QTUM testnet. 
2. Document the deployment procedure.

## License
MIT
