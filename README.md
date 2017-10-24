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

## Deployment on QTUM Testnet (without Docker):

1. enter source code dir

2. Assuming tools Solidity & Ethabi are installed

3. Compile solidity code

    ```
    solc --optimize --bin --abi --hashes --allow-paths libs/* -o bodhitoken --overwrite tokens/BodhiToken.sol

    ls bodhitoken
    # corresponding files compiled
    BasicToken.abi           BodhiToken.bin           ERC20.signatures         Ownable.abi              SafeMath.bin             StandardToken.signatures
    BasicToken.bin           BodhiToken.signatures    ERC20Basic.abi           Ownable.bin              SafeMath.signatures      lib
    BasicToken.signatures    ERC20.abi                ERC20Basic.bin           Ownable.signatures       StandardToken.abi
    BodhiToken.abi           ERC20.bin                ERC20Basic.signatures    SafeMath.abi             StandardToken.bi
    ```

4. Ensure qtum testnet is running

    `bin/qtumd -testnet -logevents`

    `-logevents` is optional for event log, you may be asked to add `-reindex` if existing local db is init without event logs

5. generate owner address


    ```
    bin/qtum-cli -testnet getaccountaddress bodhi-owner
    qdghGtMxvfxPzdSJHNvJhN6gpzZSYdLDRN

    bin/qtum-cli -testnet listaccounts
    {
      "": 0.00000000,
      "bodhi-owner": 0.00000000
    }
    ```

    Note: `testnet` addr starts with 'q', `mainnet` addr starts with `Q`

    if your balance is 0.0, pls request test token at http://testnet-faucet.qtum.info/#!/ and verify it by

    ```
    bin/qtum-cli -testnet getbalance
    94.00000000
    ```


6. Copy previous compiled smartcontract binary code

    ```
    # mac only
    cat /yourpath/bodhitoken/BodhiToken.bin  | pbcopy

    ```
7. Create contract using smartcontract binary code

    ```
    bin/qtum-cli -testnet createcontract 6060604052341561000f57600080fd5b60038054600160a060020a03191633600160a060020a031617905561080d806100396000396000f300606060405236156100c25763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166.... 2500000 0.00000049 qdghGtMxvfxPzdSJHNvJhN6gpzZSYdLDRN
    ```

      Deployment succeeds by seeing this:

    ```
    {
      "txid": "72b0f2eeeb29b6c3ebf5808ec075d07aeedbf37f546c007367ee50bb11300b60",
      "sender": "qdghGtMxvfxPzdSJHNvJhN6gpzZSYdLDRN",
      "hash160": "dcc48d3cfd6976545cb9bcf525ebad3a1b60d3bd",
      "address": "cde3c5db274b7f38377a66607c5a9ca6889dea3b"
    }
    ```

    `sender` should match your own account

    `address` is the address for this smart contract

    `hash` is hash160(sender)

8. Verification
  * list contract in current block, `hash` should appear

  ```
  bin/qtum-cli -testnet listcontracts
  {
    "ddce483f940efe54a9f46f95486489b65092b68f": 0.00000000,
    ...
  }
  ```

  * get interface of smart contract

  ```
  bin/qtum-cli -testnet getaccountinfo ddce483f940efe54a9f46f95486489b65092b68f
{
  "address": "ddce483f940efe54a9f46f95486489b65092b68f",
  "balance": 0,
  "storage": {
    "036b6384b5eca791c62761152d0c79bb0604c104a5fb6f4eb0703f3154bb3db0": {
      "0000000000000000000000000000000000000000000000000000000000000005": "6800000000000000000000000000000000000000000000000000000000000002"
    },
    "405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace": {
      "0000000000000000000000000000000000000000000000000000000000000002": "00000000000000000000000000000000000000000000000000000000000001f4"
    },
    "8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b": {
      "0000000000000000000000000000000000000000000000000000000000000004": "0000000000000000000000000000000000000000000000000000000000000001"
    },
    "a50c72e4d7b00e75c6ec9cbfb411824ce1bc8c910cb84e72aed31d83c0caaf5a": {
      "e5d6541440c456f878016c6ac621d20fa7af44175ddebd0295194adfa766ddf6": "00000000000000000000000000000000000000000000000000000000000001f4"
    },
    "c2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b": {
      "0000000000000000000000000000000000000000000000000000000000000003": "7200000000000000000000000000000000000000000000000000000000000002"
    },
    "f652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f": {
      "0000000000000000000000000000000000000000000000000000000000000006": "48312e3000000000000000000000000000000000000000000000000000000008"
    }
  },
  "code": "606060405236156100ad576000357c0100000000000000000..."
}
  ```

9. Call smartcontract

  * find available func
  ```
  cat /yourpath/bodhitoken/BodhiToken.signatures
dd62ed3e: allowance(address,address)
095ea7b3: approve(address,uint256)
70a08231: balanceOf(address)
313ce567: decimals()
3542aee2: mintByOwner(address,uint256)
06fdde03: name()
8da5cb5b: owner()
95d89b41: symbol()
f7abab9e: tokenTotalSupply()
18160ddd: totalSupply()
a9059cbb: transfer(address,uint256)
23b872dd: transferFrom(address,address,uint256)
f2fde38b: transferOwnership(address)
  ```

  *  call func. i.e. name

  ```
  bin/qtum-cli -testnet callcontract cde3c5db274b7f38377a66607c5a9ca6889dea3b 06fdde03
  ```


  Success Output

  ```
  {
  "address": "cde3c5db274b7f38377a66607c5a9ca6889dea3b",
  "executionResult": {
    "gasUsed": 21839,
    "excepted": "None",
    "newAddress": "cde3c5db274b7f38377a66607c5a9ca6889dea3b",
    "output": "0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b426f64686920546f6b656e000000000000000000000000000000000000000000",
    "codeDeposit": 0,
    "gasRefunded": 0,
    "depositSize": 0,
    "gasForDeposit": 0
  },
  "transactionReceipt": {
    "stateRoot": "4f2fd1cc369abf4120a509dc4ffeac19e058ff5e5988d1609ee0b5996cbb752a",
    "gasUsed": 21839,
    "bloom": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "log": [
    ]
  }
}
  ```

  Decode output to verify the correctness

  ```
  ethabi decode params -t string 0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b426f64686920546f6b656e000000000000000000000000000000000000000000
  string Bodhi Token
  ```

10. `callcontract` vs `sendtocontract`

  * callcontract - This will interact with an already deployed smart contract on the Qtum blockchain, with all computation taking place off-chain and no persistence to the blockchain. This does not require gas.


  * sendtocontract - This will interact with an already deployed smart contract on the Qtum blockchain. All computation takes place on-chain and any state changes will be persisted to the blockchain. This allows tokens to be sent to a smart contract. This requires gas.


## TODOs
1. ~~Deploy the contract to QTUM testnet.~~
2. ~~Document the deployment procedure.~~
3. call smartcontract with parameters

## License
MIT
