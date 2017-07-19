pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BodhiToken.sol";

contract BodhiToken_spec {
  function testInitialBalanceUsingDeployedContract() {
    BodhiToken bodhiToken = BodhiToken(DeployedAddresses.BodhiToken());
    uint expected = 0;

    Assert.equal(bodhiToken.balanceOf(tx.origin), expected, "Should have 0 balance at the beginning");
  }
}
