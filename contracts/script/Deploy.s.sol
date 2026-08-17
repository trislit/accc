// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ERC6551Account} from "../src/ERC6551Account.sol";
import {AcccNft} from "../src/AcccNft.sol";
import {AcccToken} from "../src/AcccToken.sol";

contract Deploy is Script {
    address constant REGISTRY = 0x000000006551c19487814612e58FE06813775758;

    function run() external {
        vm.startBroadcast();
        ERC6551Account implementation = new ERC6551Account();
        AcccNft nft = new AcccNft(REGISTRY, address(implementation));
        AcccToken token = new AcccToken();
        vm.stopBroadcast();

        console.log("NEXT_PUBLIC_TBA_REGISTRY=%s", REGISTRY);
        console.log("NEXT_PUBLIC_TBA_IMPLEMENTATION=%s", address(implementation));
        console.log("NEXT_PUBLIC_NFT=%s", address(nft));
        console.log("NEXT_PUBLIC_TOKEN=%s", address(token));
    }
}
