#!/bin/bash

echo 'Compiling with solc into /compiled'

solc --optimize --bin --abi --hashes --allow-paths contracts/libs/* -o compiled --overwrite contracts/tokens/BodhiToken.sol
