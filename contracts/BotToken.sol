pragma solidity ^0.4.10;

import "./ConvertLib.sol";
import "./StandardToken.sol";

contract BotToken is StandardToken {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public constant saleAmount = 60 * (10**6) * (10**decimals); // 60 million BOT tokens for sale
  uint256 public constant tokenExchangeRate = 60; // 60 BOT tokens per 1 QTUM

  // Constructor
  function BotToken(uint256 _fundingStartBlock, uint256 _fundingEndBlock) {
    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
  }
}
