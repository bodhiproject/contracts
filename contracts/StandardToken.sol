pragma solidity ^0.4.10;

// Simple implementation of a standard ERC 20 token
// Will upgrade to ERC 223, see: https://github.com/ethereum/EIPs/issues/223
contract StandardToken {
  // Gets triggered when a token transfer happens
  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  uint256 public totalSupply;
  mapping (address => uint256) balances;

  function totalSupply() constant returns (uint256) {
    return totalSupply;
  }

  function balanceOf(address _owner) constant returns (uint256) {
    return balances[_owner];
  }

  function transfer(address _to, uint256 _value) returns (bool) {
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
