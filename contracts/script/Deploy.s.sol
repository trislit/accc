// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AcccArcade} from "../src/AcccArcade.sol";
import {AcccDistributor} from "../src/AcccDistributor.sol";
import {AcccNft} from "../src/AcccNft.sol";

contract Deploy is Script {
    address constant REGISTRY = 0x000000006551c19487814612e58FE06813775758;
    address constant TBA_IMPL = 0x8A0455E86536F57323866ed13c26febAb8ae3049;

    function run() external {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);
        AcccNft nft = new AcccNft(REGISTRY, TBA_IMPL);
        AcccDistributor distributor = new AcccDistributor(address(nft));
        AcccArcade arcade = new AcccArcade(address(nft), address(distributor));
        vm.stopBroadcast();

        console.log("NEXT_PUBLIC_TBA_REGISTRY=%s", REGISTRY);
        console.log("NEXT_PUBLIC_TBA_IMPLEMENTATION=%s", TBA_IMPL);
        console.log("NEXT_PUBLIC_NFT=%s", address(nft));
        console.log("NEXT_PUBLIC_TOKEN=%s", address(distributor.token()));
        console.log("NEXT_PUBLIC_DISTRIBUTOR=%s", address(distributor));
        console.log("NEXT_PUBLIC_ARCADE=%s", address(arcade));
        console.log("mintPaused=true until Admin opens public mint");
    }
}
