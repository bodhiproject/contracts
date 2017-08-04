pragma solidity ^0.4.10;

contract TokenInterface {
    // Gets triggered when a token transfer happens
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Returns the total supply of the token
    // @return The total supply of the token
    function totalSupply() constant returns (uint256 totalSupply);

    // Returns the balance of the owner
    // @param _owner The owner address
    // @return The balance
    function balanceOf(address _owner) constant returns (uint256 balance);

    // Send `_value` tokens from `msg.sender` to `_to` 
    // @param _to The recipient address
    // @param _value The amount of token to be transferred
    // @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _value) returns (bool success);
}
