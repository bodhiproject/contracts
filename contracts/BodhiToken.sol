pragma solidity ^0.4.10;

import './StandardToken.sol';
import './Ownable.sol';

contract BodhiToken is StandardToken, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Token constants
  uint256 public constant saleAmount = 60 * (10**6) * (10**decimals); // 60 million BOT tokens for sale
  uint256 public constant tokenTotalSupply = 100 * (10**6) * (10**decimals); // 100 million BOT tokens will ever be created

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public initialExchangeRate;

  event Mint(uint256 supply, address indexed to, uint256 amount);
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  // Modifiers
  modifier validAddress(address _address) {
    require(_address != 0x0);
    _;
  }

  modifier validPurchase() {
    require(block.number >= fundingStartBlock);
    require(block.number <= fundingEndBlock);
    require(msg.value > 0);
    _;
  }

  // Constructor
  function BodhiToken(
    uint256 _fundingStartBlock,
    uint256 _fundingEndBlock,
    uint256 _initialExchangeRate,
    uint256 _presaleAmount) {
    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_initialExchangeRate > 0);
    require(_presaleAmount <= saleAmount);

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    initialExchangeRate = _initialExchangeRate;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordinglly
    mint(owner, _presaleAmount);
  }

  function exchangeTokenAmount(uint256 _weiAmount) constant returns(uint256) {
    return initialExchangeRate.mul(_weiAmount);
  }

  // Fallback function to accept QTUM during token sale
  function () external payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) 
    payable 
    validAddress(_beneficiary) 
    validPurchase
  {
    uint256 tokenAmount = exchangeTokenAmount(msg.value);
    uint256 checkedSupply = totalSupply.add(tokenAmount);

    // Ensure new token increment does not exceed the sale amount
    assert(checkedSupply <= saleAmount);

    mint(msg.sender, tokenAmount);
    TokenPurchase(msg.sender, _beneficiary, msg.value, tokenAmount);

    forwardFunds();
  }

  function mintReservedTokens(uint256 _amount) onlyOwner {
    uint256 checkedSupply = totalSupply.add(_amount);
    require(checkedSupply <= tokenTotalSupply);

    mint(owner, _amount);
  }

  // Send ether to the fund collection owner
  function forwardFunds() internal {
    owner.transfer(msg.value);
  }

   /**
   * @dev Function to mint tokens
   */
  function mint(address _to, uint256 _amount) internal returns (bool) {
    totalSupply += _amount;
    balances[_to] = balances[_to].add(_amount);
    Mint(totalSupply, _to, _amount);
    return true;
  }
}
