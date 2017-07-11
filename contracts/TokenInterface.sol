pragma solidity ^0.4.10;

contract TokenInterface {
    // Gets triggered when a token transfer happens
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Gets triggered when a token approval happens
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

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

    // Send `_value` tokens from `_from` to `_to`
    // @param _from The sender address
    // @param _to The recipient address
    // @param _value The amount of token to be transferred
    // @return Whether the transfer was successful or not
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success);

    // Approves `_spender` to spend `_value` tokens
    // @param _spender The address of the account able to transfer the tokens
    // @param _value The amount of tokens to be approved for transfer
    // @return Whether the approval was successful or not
    function approve(address _spender, uint256 _value) returns (bool success);

    // @param _owner The account address owning the tokens
    // @param _spender The account address that's able to transfer the tokens
    // @return Amount of remaining tokens allowed to spent
    function allowance(address _owner, address _spender) constant returns (uint256 remaining);
}