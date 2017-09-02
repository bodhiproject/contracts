pragma solidity ^0.4.10;

import './StandardToken.sol';
import './Ownable.sol';

contract BodhiToken is StandardToken, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public constant saleAmount = 60e6 ether; // 60 million BOT tokens for sale
  uint256 public constant tokenTotalSupply = 100e6 ether; // 100 million BOT tokens will ever be created
  uint256 public initialExchangeRate;

  address public wallet;

  event Mint(uint256 supply, address indexed to, uint256 amount);
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  // Modifiers
  modifier validAddress(address _address) {
    require(_address != 0x0);
    _;
  }

  // Constructor
  function BodhiToken(
    uint256 _fundingStartBlock,
    uint256 _fundingEndBlock,
    uint256 _initialExchangeRate,
    uint256 _presaleAmount,
    address _wallet) {

    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_wallet != address(0));
    require(_presaleAmount <= saleAmount);
    require(_initialExchangeRate > 0);

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    wallet = _wallet;
    initialExchangeRate = _initialExchangeRate;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordinglly
    mint(wallet, _presaleAmount);
  }

  function exchangeTokenAmount(uint256 weiAmount) constant returns(uint256) {
    return initialExchangeRate.mul(weiAmount);
  }

  // Fallback function to accept QTUM during token sale
  function () external payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address _beneficiary) payable validAddress(_beneficiary) {
    require(isValidPurchase());

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

  function isValidPurchase() internal constant returns (bool) {
    bool isValidBlock = block.number >= fundingStartBlock && block.number <= fundingEndBlock;
    bool isNonZeroPurchase = msg.value > 0;
    return isValidBlock && isNonZeroPurchase;
  }
}
