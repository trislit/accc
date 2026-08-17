// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IAcccDistributor {
    function syncAccount(address account) external;
}

/// @dev Testnet $ACCC. Not the production token.
contract AcccToken is ERC20 {
    address public immutable minter;

    constructor(address minter_) ERC20("ACCC", "ACCC") {
        require(minter_ != address(0), "zero minter");
        minter = minter_;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "not minter");
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        address m = minter;
        if (m.code.length == 0) return;
        if (from != address(0)) {
            IAcccDistributor(m).syncAccount(from);
        }
        if (to != address(0) && to != from) {
            IAcccDistributor(m).syncAccount(to);
        }
    }
}
