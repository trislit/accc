// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AcccArcade} from "../src/AcccArcade.sol";

contract DeployArcade is Script {
    address constant NFT = 0xB740c4bef629d15A4B3058368E6CBC807dbC0357;
    address constant DISTRIBUTOR = 0x3448096b67f3459EE2458c3618Db57a47ca602cD;

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
