pragma solidity ^0.4.10;

import './StandardToken.sol';
import './Ownable.sol';

contract BodhiToken is StandardToken, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Token constants
  uint256 public constant MAX_TOKENS_FOR_SALE = 60e6 ether; // 60 million BOT tokens for sale
  uint256 public constant MAX_TOKEN_SUPPLY = 100e6 ether; // 100 million BOT tokens will ever be created

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public initialExchangeRate;
  address public wallet;

  event Mint(uint256 supply, address indexed to, uint256 amount);

  // Constructor
  function BodhiToken(
    uint256 _fundingStartBlock,
    uint256 _fundingEndBlock,
    uint256 _initialExchangeRate,
    uint256 _presaleAmount,
    address _wallet) 
  {
    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_initialExchangeRate > 0);
    require(_presaleAmount <= MAX_TOKENS_FOR_SALE);
    require(_wallet != address(0));

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    initialExchangeRate = _initialExchangeRate;
    wallet = _wallet;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordinglly
    mint(wallet, _presaleAmount);
  }

  function exchangeTokenAmount(uint256 weiAmount) constant returns(uint256) {
    return initialExchangeRate.mul(weiAmount);
  }

  // Fallback function to accept QTUM during token sale
  function () payable external {
    require(block.number >= fundingStartBlock);
    require(block.number <= fundingEndBlock);
    require(msg.value > 0);

    uint256 tokenAmount = exchangeTokenAmount(msg.value);
    uint256 checkedSupply = totalSupply.add(tokenAmount);

    // Ensure new token increment does not exceed the sale amount
    assert(checkedSupply <= MAX_TOKENS_FOR_SALE);

    mint(msg.sender, tokenAmount);
    forwardFunds();
  }

  function mintReservedTokens(uint256 _amount) onlyOwner {
    uint256 checkedSupply = totalSupply.add(_amount);
    require(checkedSupply <= MAX_TOKEN_SUPPLY);

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
    balances[_to] = balances[_to].add(_amount);
    Mint(totalSupply, _to, _amount);
    return true;
  }
}
