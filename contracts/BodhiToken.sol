pragma solidity ^0.4.10;

import "./ConvertLib.sol";
import "./SafeMath.sol";
import "./StandardToken.sol";

contract BodhiToken is StandardToken, SafeMath {
  event TokenCreation(address indexed _to, uint256 _value);

  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public currentSupply;
  uint256 public constant saleAmount = 60 * (10**6) * (10**decimals); // 60 million BOT tokens for sale
  uint256 public constant tokenTotalSupply = 100 * (10**6) * (10**decimals); // 100 million BOT tokens will ever be created
  uint256 public constant tokenExchangeRate = 60; // 60 BOT tokens per 1 QTUM

  // Constructor
  function BodhiToken(uint256 _fundingStartBlock, uint256 _fundingEndBlock, uint256 _presaleAmount) {
    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    currentSupply = _presaleAmount;
  }

  // Fallback function to accept QTUM during token sale
  function () payable external {
    if (block.number < fundingStartBlock) throw;
    if (block.number > fundingEndBlock) throw;
    if (msg.value == 0) throw;

    uint256 bodhiTokenNumber = safeMult(msg.value, tokenExchangeRate);
    uint256 checkedSupply = safeAdd(currentSupply, bodhiTokenNumber);

    if (checkedSupply > tokenTotalSupply) throw;

    currentSupply = checkedSupply;
    balances[msg.sender] += bodhiTokenNumber;

    TokenCreation(msg.sender, bodhiTokenNumber);
  }
}
