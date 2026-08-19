// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC6551Account} from "../src/ERC6551Account.sol";
import {ERC6551Registry} from "../src/ERC6551Registry.sol";
import {AcccNft} from "../src/AcccNft.sol";

contract AcccNftTest is Test {
    ERC6551Registry internal registry;
    ERC6551Account internal implementation;
    AcccNft internal nft;
    address internal leader = makeAddr("leader");
    address internal publicMinter = makeAddr("public");

    function setUp() public {
        registry = new ERC6551Registry();
        implementation = new ERC6551Account();
        nft = new AcccNft(address(registry), address(implementation));
    }

    function testPublicMintRevertsWhilePaused() public {
        vm.expectRevert("paused");
        nft.mint();
    }

    function testMintToSpecificIdAndPublicSkipsIt() public {
        address tba = nft.mintTo(leader, 7);
        assertEq(nft.ownerOf(7), leader);
        assertTrue(nft.core(7));
        assertFalse(nft.reserved(7));
        assertGt(tba.code.length, 0);
        assertEq(tba, nft.accountOf(7));

        nft.setPaused(false);
        vm.prank(publicMinter);
        (uint256 first,) = nft.mint();
        vm.prank(publicMinter);
        (uint256 second,) = nft.mint();
        assertEq(first, 1);
        assertEq(second, 2);

        // Keep minting until we pass 7.
        uint256 last;
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(publicMinter);
            (last,) = nft.mint();
        }
        assertEq(last, 8);
        assertEq(nft.ownerOf(7), leader);
    }

    function testReservedIdSkippedUntilMintTo() public {
        nft.reserve(1, true);
        nft.setPaused(false);
        vm.prank(publicMinter);
        (uint256 tokenId,) = nft.mint();
        assertEq(tokenId, 2);

        nft.mintTo(leader, 1);
        assertEq(nft.ownerOf(1), leader);
        assertTrue(nft.core(1));
    }

    function testCannotMintToExisting() public {
        nft.setPaused(false);
        nft.mint();
        vm.expectRevert("minted");
        nft.mintTo(leader, 1);
    }

    function testOnlyOwnerMintsTo() public {
        vm.prank(publicMinter);
        vm.expectRevert("not owner");
        nft.mintTo(leader, 1);
    }
}
