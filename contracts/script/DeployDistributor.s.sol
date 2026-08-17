// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {AcccDistributor} from "../src/AcccDistributor.sol";

contract DeployDistributor is Script {
    address constant NFT = 0xdcbC12c8ebe5cD0E24B414F51283F7afE0d35cA5;

    function run() external {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);
        AcccDistributor distributor = new AcccDistributor(NFT);
        vm.stopBroadcast();

        console.log("NEXT_PUBLIC_NFT=%s", NFT);
        console.log("NEXT_PUBLIC_TOKEN=%s", address(distributor.token()));
        console.log("NEXT_PUBLIC_DISTRIBUTOR=%s", address(distributor));
    }
}
