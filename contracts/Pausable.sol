pragma solidity ^0.4.11;

import './Ownable.sol';

/**
 * @title Adds pausable functionality to other contracts
 * @dev Base contract that allows a mechanism to stop defined pausable actions.
 */
contract Pausable is Ownable {
	bool public paused = false;

	// Events
	event Pause();
	event Unpause();

	// Modifiers
	modifier whenPaused() {
		require(paused);
		_;
	}

	modifier whenNotPaused() {
		require(!paused);
		_;
	}

	/// @notice Allows the owner to pause the contract
	function pause() public onlyOwner whenNotPaused {
		paused = true;
		Pause();
	}

	/// @notice Allows the owner to unpause the contract
	function unpause() public onlyOwner whenPaused {
		paused = false;
		Unpause();
	}
}
