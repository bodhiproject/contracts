pragma solidity ^0.4.10;

import './StandardToken.sol';
import './Ownable.sol';

contract BodhiToken is StandardToken, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant nativeDecimals = 18;
  uint256 public constant decimals = 18;

  /// @notice 60 million BOT tokens for sale
  uint256 public constant saleAmount = 60 * (10**6) * (10**decimals);

  /// @notice 100 million BOT tokens will ever be created
  uint256 public constant tokenTotalSupply = 100 * (10**6) * (10**decimals);

  // Crowdsale parameters
  uint256 public fundingStartBlock;
  uint256 public fundingEndBlock;
  uint256 public initialExchangeRate;

  // Events
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

  /// @notice Creates new BodhiToken contract
  /// @param _fundingStartBlock The starting block of crowdsale
  /// @param _fundingEndBlock The ending block of crowdsale
  /// @param _initialExchangeRate The exchange rate of Ether to BOT
  /// @param _presaleAmount The amount of BOT that will be available for presale
  function BodhiToken(
    uint256 _fundingStartBlock,
    uint256 _fundingEndBlock,
    uint256 _initialExchangeRate,
    uint256 _presaleAmount) {
    require(_fundingStartBlock >= block.number);
    require(_fundingEndBlock >= _fundingStartBlock);
    require(_initialExchangeRate > 0);

    // Converted to lowest denomination of BOT
    uint256 presaleAmountTokens = _presaleAmount * (10**decimals);
    require(presaleAmountTokens <= saleAmount);
    
    assert(nativeDecimals >= decimals);

    fundingStartBlock = _fundingStartBlock;
    fundingEndBlock = _fundingEndBlock;
    initialExchangeRate = _initialExchangeRate;

    // Mint the presale tokens, distribute to a receiver
    // Increase the totalSupply accordingly
    mint(owner, presaleAmountTokens);
  }

  /// @notice Fallback function to purchase tokens
  function() external payable {
    buyTokens(msg.sender);
  }

  /// @notice Allows buying tokens from different address than msg.sender
  /// @param _beneficiary Address that will contain the purchased tokens
  function buyTokens(address _beneficiary) 
    payable 
    validAddress(_beneficiary) 
    validPurchase
  {
    uint256 tokenAmount = getTokenExchangeAmount(msg.value);
    uint256 checkedSupply = totalSupply.add(tokenAmount);

    // Ensure new token increment does not exceed the sale amount
    assert(checkedSupply <= saleAmount);

    mint(_beneficiary, tokenAmount);
    TokenPurchase(msg.sender, _beneficiary, msg.value, tokenAmount);

    forwardFunds();
  }

  /// @notice Allows contract owner to mint tokens at any time
  /// @param _amount Amount of tokens to mint in lowest denomination of BOT
  function mintReservedTokens(uint256 _amount) onlyOwner {
    uint256 checkedSupply = totalSupply.add(_amount);
    require(checkedSupply <= tokenTotalSupply);

    mint(owner, _amount);
  }

  /// @notice Shows the amount of BOT the user will receive for amount of exchanged wei
  /// @param _weiAmount Exchanged wei amount to convert
  /// @param _nativeDecimals Number of decimals of the token being exchange for BOT
  /// @param _decimals Number of decimals of BOT token
  /// @param _exchangeRate Number of BOT per exchange token
  /// @return The amount of BOT that will be received
  function getTokenExchangeAmount(
    uint256 _weiAmount, 
    uint8 _nativeDecimals, 
    uint8 _decimals, 
    uint8 _exchangeRate) 
    constant 
    returns(uint256) 
  {
    require(_weiAmount > 0);

    uint256 differenceFactor = (10**_nativeDecimals) / (10**_decimals);
    return _weiAmount.mul(_exchangeRate).div(differenceFactor);
  }

  /// @dev Sends Ether to the contract owner
  function forwardFunds() internal {
    owner.transfer(msg.value);
  } 

  /// @dev Mints new tokens
  /// @param _to Address to mint the tokens to
  /// @param _amount Amount of tokens that will be minted
  /// @return Boolean to signify successful minting
  function mint(address _to, uint256 _amount) internal returns (bool) {
    totalSupply += _amount;
    balances[_to] = balances[_to].add(_amount);
    Mint(totalSupply, _to, _amount);
    return true;
  }
}
