// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC6551Account} from "../src/ERC6551Account.sol";
import {ERC6551Registry} from "../src/ERC6551Registry.sol";
import {AcccDistributor} from "../src/AcccDistributor.sol";
import {AcccNft} from "../src/AcccNft.sol";
import {AcccToken} from "../src/AcccToken.sol";

contract AcccDistributorTest is Test {
    ERC6551Registry internal registry;
    ERC6551Account internal implementation;
    AcccNft internal nft;
    AcccDistributor internal distributor;
    AcccToken internal token;

    function setUp() public {
        registry = new ERC6551Registry();
        implementation = new ERC6551Account();
        nft = new AcccNft(address(registry), address(implementation));
        nft.setPaused(false);
        distributor = new AcccDistributor(address(nft));
        token = distributor.token();
    }

    function testGenesisMintsToTbaNotCaller() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        assertEq(token.balanceOf(tba), distributor.GENESIS_AMOUNT());
        assertEq(token.balanceOf(address(this)), 0);
        assertTrue(distributor.genesisClaimed(tokenId));
        assertEq(distributor.eligiblePrincipal(tokenId), distributor.GENESIS_AMOUNT());
    }

    function testSecondGenesisReverts() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.expectRevert("already claimed");
        distributor.claimGenesis(tokenId);
    }

    function testFullPrincipalEarnsMoreThanHalf() public {
        (uint256 fullId,) = nft.mint();
        (uint256 halfId, address halfTba) = nft.mint();
        distributor.claimGenesis(fullId);
        distributor.claimGenesis(halfId);

        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 500 ether));
        ERC6551Account(payable(halfTba)).execute(address(token), 0, data, 0);
        assertEq(distributor.eligiblePrincipal(halfId), 500 ether);

        vm.warp(block.timestamp + 365 days);
        assertEq(distributor.pendingYield(fullId), 100 ether);
        assertEq(distributor.pendingYield(halfId), 50 ether);
        assertGt(distributor.pendingYield(fullId), distributor.pendingYield(halfId));
    }

    function testWithdrawHalfCutsEligible() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 500 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, data, 0);
        assertEq(distributor.eligiblePrincipal(tokenId), 500 ether);
        assertEq(token.balanceOf(tba), 500 ether);
    }

    function testWithdrawAllZerosEligible() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 1000 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, data, 0);
        assertEq(distributor.eligiblePrincipal(tokenId), 0);
        assertEq(token.balanceOf(tba), 0);
    }

    function testWithdrawAllThenDepositDoesNotRestoreEligible() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 1000 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, data, 0);
        token.transfer(tba, 1000 ether);
        assertEq(token.balanceOf(tba), 1000 ether);
        assertEq(distributor.eligiblePrincipal(tokenId), 0);

        vm.warp(block.timestamp + 365 days);
        assertEq(distributor.pendingYield(tokenId), 0);
    }

    function testDepositExtraDoesNotRaiseEligible() public {
        (uint256 firstId, address firstTba) = nft.mint();
        (uint256 secondId, address secondTba) = nft.mint();
        distributor.claimGenesis(firstId);
        distributor.claimGenesis(secondId);

        bytes memory pull = abi.encodeCall(IERC20.transfer, (address(this), 1000 ether));
        ERC6551Account(payable(secondTba)).execute(address(token), 0, pull, 0);
        token.transfer(firstTba, 1000 ether);

        assertEq(token.balanceOf(firstTba), 2000 ether);
        assertEq(distributor.eligiblePrincipal(firstId), 1000 ether);
    }

    function testHarvestDoesNotRaiseEligible() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);
        assertEq(token.balanceOf(tba), 1100 ether);
        assertEq(distributor.eligiblePrincipal(tokenId), 1000 ether);
        assertEq(distributor.pendingYield(tokenId), 0);
    }

    function testUnmintedGenesisReverts() public {
        vm.expectRevert();
        distributor.claimGenesis(1);
    }

    function testReservedGrantMintsMoreAndEarnsMore() public {
        distributor.seedNextMints(5_000 ether, 1);
        (uint256 specialId, address specialTba) = nft.mint();
        (uint256 baseId,) = nft.mint();

        assertTrue(distributor.isSpecial(specialId));
        assertFalse(distributor.isSpecial(baseId));
        assertEq(distributor.grantOf(specialId), 5_000 ether);
        assertEq(distributor.grantOf(baseId), 1_000 ether);

        distributor.claimGenesis(specialId);
        distributor.claimGenesis(baseId);
        assertEq(token.balanceOf(specialTba), 5_000 ether);
        assertEq(distributor.eligiblePrincipal(specialId), 5_000 ether);

        vm.warp(block.timestamp + 365 days);
        assertEq(distributor.pendingYield(specialId), 500 ether);
        assertEq(distributor.pendingYield(baseId), 100 ether);
    }

    function testSetGrantOnExistingUnclaimed() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.setGrant(tokenId, 2_000 ether);
        distributor.claimGenesis(tokenId);
        assertEq(token.balanceOf(tba), 2_000 ether);
    }

    function testCannotChangeGrantAfterClaim() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.expectRevert("claimed");
        distributor.setGrant(tokenId, 5_000 ether);
    }

    function testSeedNextMintsSkipsReservedCore() public {
        nft.reserve(1, true);
        distributor.seedNextMints(5_000 ether, 1);
        assertEq(distributor.grantOf(1), 1_000 ether);
        assertEq(distributor.grantOf(2), 5_000 ether);
    }

    function testOnlyOwnerSeeds() public {
        vm.prank(address(1));
        vm.expectRevert("not owner");
        distributor.seedNextMints(5_000 ether, 1);
    }
}
