pragma solidity ^0.4.10;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BotToken.sol";

contract BotToken_spec {
  function testInitialBalanceUsingDeployedContract() {
    BotToken botToken = BotToken(DeployedAddresses.BotToken());
    uint expected = 0;

    Assert.equal(botToken.balanceOf(tx.origin), expected, "Should have 0 balance at the beginning");
  }
}
