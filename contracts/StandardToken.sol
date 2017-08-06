pragma solidity ^0.4.10;

import "./TokenInterface.sol";

// Simple implementation of a standard ERC 20 token
// Will upgrade to ERC 223, see: https://github.com/ethereum/EIPs/issues/223
contract StandardToken is TokenInterface {
  uint256 public totalSupply;
  mapping (address => uint256) balances;

  function totalSupply() constant returns (uint256 totalSupply) {
    return totalSupply;
  }

  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }

  function transfer(address _to, uint256 _value) returns (bool success) {
    if (balances[msg.sender] >= _value && _value > 0) {
      balances[msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(msg.sender, _to, _value);
      return true;
    } else {
      return false;
    }
  }
}
