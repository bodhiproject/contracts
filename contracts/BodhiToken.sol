pragma solidity ^0.4.10;

import './StandardToken.sol';
import './Ownable.sol';
import './SafeMath.sol';

contract BodhiToken is StandardToken, SafeMath, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public constant saleAmount = 60000000 ether; // 60 million BOT tokens for sale
  uint256 public constant tokenTotalSupply = 100000000 ether; // 100 million BOT tokens will ever be created
  uint256 public decayPeriod; // decay 10% per `decayPeriod` blocks
  uint256 public initialExchangeRate;

  address public wallet;

  event Mint(uint256 supply, address indexed to, uint256 amount);

  // Constructor
  function BodhiToken(
    uint256 _fundingStartBlock, 
    uint256 _fundingEndBlock, 
    uint256 _initialExchangeRate, 
    uint256 _decayPeriod,
    uint256 _presaleAmount, 
    address _wallet) {

    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_wallet != address(0));
    require(_presaleAmount <= saleAmount);
    require(_initialExchangeRate > 0);
    // decayPeriod must be positive and less than the open period
    require(_decayPeriod > 0 && _decayPeriod <= (_fundingEndBlock - _fundingStartBlock));

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    wallet = _wallet;
    initialExchangeRate = _initialExchangeRate;
    decayPeriod = _decayPeriod;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordinglly 
    mint(wallet, _presaleAmount);
  }

  function exchangeTokenAmount(uint256 weiAmount) constant returns(uint256) {
    // Token amount decay 10% every 1000 blocks
    // `decayFactor` is in 0.1%
    uint256 decayFactor = 1000 - (block.number - fundingStartBlock) / decayPeriod * 100;
    assert(decayFactor >= 0 && decayFactor <= 1000);

    uint256 rate = initialExchangeRate * decayFactor / 1000;

    return mul(rate, weiAmount);
  }

  // Fallback function to accept QTUM during token sale
  function () payable external {
    require(block.number >= fundingStartBlock);
    require(block.number <= fundingEndBlock);
    require(msg.value > 0);

    uint256 tokenAmount = exchangeTokenAmount(msg.value);
    uint256 checkedSupply = add(totalSupply, tokenAmount);

    // Ensure new token increment does not exceed the total supply
    assert(checkedSupply <= tokenTotalSupply);

    mint(msg.sender, tokenAmount);
    forwardFunds();
  }

  function mintReservedTokens(uint256 _amount) onlyOwner {
    uint256 checkedSupply = add(totalSupply, _amount);
    require(checkedSupply <= tokenTotalSupply);

    mint(wallet, _amount);
  }

  // Send ether to the fund collection wallet
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

   /**
   * @dev Function to mint tokens
   */
  function mint(address _to, uint256 _amount) internal returns (bool) {
    totalSupply += _amount;
    balances[_to] = add(balances[_to], _amount);
    Mint(totalSupply, _to, _amount);
    return true;
  }
}
