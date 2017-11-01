# Bodhi Token and Crowdsale Contracts 

## Wiki
For more information, visit our wiki page: [https://bodhiproject.github.io/wiki/](https://bodhiproject.github.io/wiki/)

## Build Status
[https://travis-ci.com/bodhiproject/contracts.svg?token=yhzSGYVKSykUrXc4FYC8&branch=master](https://travis-ci.com/bodhiproject/contracts)

## Environment Setup

### Toolchain

* __truffle__: contract development environment
* __mocha__ (included in truffle): test framework (provides DSL like `decsribe`, `it`, `beforeEach` etc.)
* __chai__: enhanced assertion library
* __ethereum-testrpc__: EVM and blockchain simulator

### Setup Test Environment
1. Install Node JS: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

    Tests use `async/await` so v7.0 or higher.
    
    via commandline:

        $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
        $ nvm install 7
        $ nvm use 7

2. Install truffle globally (currently 4.0.1):

        $ npm install -g truffle@^4.0.1

3. Pull the codebase:

        $ git clone git@github.com:bodhiproject/contracts.git
        $ cd contracts

3. Run the NPM package.json script:

        $ npm install

4. Start truffle dev environment:

        $ truffle develop
        Truffle Develop started at http://localhost:9545/

        Accounts:
        (0) 0x627306090abab3a6e1400e9345bc60c78a8bef57
        (1) 0xf17f52151ebef6c7334fad080c5704d77216b732
        (2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef
        (3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544
        (4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
        (5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e
        (6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5
        (7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5
        (8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc
        (9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de

        Mnemonic: candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

        truffle(develop)> 

5. (Optional) If you want to see the logs from the test, open a new terminal window and:

        $ truffle develop --log

6. Run test in truffle dev command line:

        truffle(develop)> test


## License
MIT