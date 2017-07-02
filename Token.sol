pragma solidity ^0.4.10;

contract Token {
  mapping (address => uint256) balance;

  event Transfer(address indexed from, address indexed to, uint256 value);

  function balanceOf(address owner) constant returns (uint256 balance) {
    return balance[owner];
  }

  function transfer(address to, uint256 value) returns (bool success) {
    if (balance[msg.sender] >= value && value > 0) {
      balance[msg.sender] -= value;
      balance[to] += value;
      Transfer(msg.sender, to, value);
      return true;
    }
    return false;
  }
}
