pragma solidity ^0.4.10;

import "./MintableToken.sol";

contract BodhiToken is MintableToken {
  // User exchange token will emit this event.
  // For presale and after ICO mint, there will be a `Mint` event.
  event TokenCreation(address indexed _to, uint256 _value);

  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public constant saleAmount = 60e6 ether; // 60 million BOT tokens for sale
  uint256 public constant tokenTotalSupply = 100e6 ether; // 100 million BOT tokens will ever be created
  uint256 public constant tokenExchangeRate = 60; // 60 BOT tokens per 1 QTUM

  address public wallet;

  // Constructor
  function BodhiToken(uint256 _fundingStartBlock, uint256 _fundingEndBlock, uint256 _presaleAmount, address _wallet) {
    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_wallet != address(0));
    require(_presaleAmount <= saleAmount);

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    wallet = _wallet;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordinglly 
    mint(wallet, _presaleAmount);
  }

  // Fallback function to accept QTUM during token sale
  function () payable external {
    require(block.number >= fundingStartBlock);
    require(block.number <= fundingEndBlock);
    require(msg.value > 0);

    uint256 tokenAmount = mul(msg.value, tokenExchangeRate);
    uint256 checkedSupply = add(totalSupply, tokenAmount);

    // Ensure new token increment does not exceed the total supply
    assert(checkedSupply <= tokenTotalSupply);

    mint(msg.sender, tokenAmount);
  }
}
