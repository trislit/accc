// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AcccArcade} from "../src/AcccArcade.sol";

contract DeployArcade is Script {
    address constant NFT = 0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5;
    address constant DISTRIBUTOR = 0x56deD1a8d70893113Cff4289e204B142d4ce5eDA;

    function run() external {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);
        AcccArcade arcade = new AcccArcade(NFT, DISTRIBUTOR);
        vm.stopBroadcast();

        console.log("NEXT_PUBLIC_ARCADE=%s", address(arcade));
        console.log("NEXT_PUBLIC_NFT=%s", NFT);
        console.log("NEXT_PUBLIC_DISTRIBUTOR=%s", DISTRIBUTOR);
    }
}
