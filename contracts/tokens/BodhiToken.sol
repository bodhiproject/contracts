pragma solidity ^0.4.15;

import './StandardToken.sol';
import '../libs/Ownable.sol';

contract BodhiToken is StandardToken, Ownable {
  // Token configurations
  string public constant name = "Bodhi Token";
  string public constant symbol = "BOT";
  uint256 public constant decimals = 18;
  uint256 public constant nativeDecimals = 18;

  uint256 public constant tokenTotalSupply = 100 * (10**6) * (10**decimals); // 100 million BOT ever created
  uint256 public constant maxTokensForSale = 60 * (10**6) * (10**decimals); // Max number of tokens for sale
  uint256 public constant exchangeRate = 100; // 100 BOT per native token

  // Events
  event Mint(uint256 supply, address indexed to, uint256 amount);
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

  /// @notice Creates new BodhiToken contract
  /// @param _exchangeRate The exchange rate of Ether to BOT
  function BodhiToken() public {
    assert(nativeDecimals >= decimals);
    mint(owner, tokenTotalSupply);
  }

  /// @notice Fallback function to purchase tokens
  function() external payable {
    buyTokens(msg.sender);
  }

  /// @notice Allows buying tokens from different address than msg.sender
  /// @param _beneficiary Address that will contain the purchased tokens
  function buyTokens(address _beneficiary) public payable {
    require(_beneficiary != address(0));
    require(msg.value > 0);

    uint256 tokenAmount = getTokenExchangeAmount(msg.value, exchangeRate, nativeDecimals, decimals);
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
  /// @param _exchangeRate Number of BOT per exchange token
  /// @param _nativeDecimals Number of decimals of the token being exchange for BOT
  /// @param _decimals Number of decimals of BOT token
  /// @return The amount of BOT that will be received
  function getTokenExchangeAmount(
    uint256 _weiAmount, 
    uint256 _exchangeRate,
    uint256 _nativeDecimals, 
    uint256 _decimals) 
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
