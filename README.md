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
    
## TODOs
1. Deploy the contract to QTUM testnet. 
2. Document the deployment procedure.

## License
MIT
