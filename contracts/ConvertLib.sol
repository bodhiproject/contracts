pragma solidity ^0.4.10;

// Sida: no idea what this does, will keep it for now
library ConvertLib {
  function convert(uint amount, uint conversionRate) returns (uint convertedAmount) {
    return amount * conversionRate;
  }
}
