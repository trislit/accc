// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Testnet $ACCC. Not the production token.
contract AcccToken is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1_000 * 1e18;

    constructor() ERC20("ACCC", "ACCC") {}

    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
