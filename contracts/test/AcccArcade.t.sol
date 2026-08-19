// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AcccArcade} from "../src/AcccArcade.sol";
import {AcccDistributor} from "../src/AcccDistributor.sol";
import {AcccNft} from "../src/AcccNft.sol";
import {AcccToken} from "../src/AcccToken.sol";
import {ERC6551Account} from "../src/ERC6551Account.sol";
import {ERC6551Registry} from "../src/ERC6551Registry.sol";

contract AcccArcadeTest is Test {
    ERC6551Registry internal registry;
    ERC6551Account internal implementation;
    AcccNft internal nft;
    AcccDistributor internal distributor;
    AcccToken internal token;
    AcccArcade internal arcade;

    function setUp() public {
        registry = new ERC6551Registry();
        implementation = new ERC6551Account();
        nft = new AcccNft(address(registry), address(implementation));
        distributor = new AcccDistributor(address(nft));
        token = distributor.token();
        arcade = new AcccArcade(address(nft), address(distributor));
    }

    function testSpendableIsTbaMinusPrincipal() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        assertEq(arcade.spendable(tokenId), 0);

        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);
        assertEq(token.balanceOf(tba), 1100 ether);
        assertEq(distributor.eligiblePrincipal(tokenId), 1000 ether);
        assertEq(arcade.spendable(tokenId), 100 ether);
    }

    function testPlaySinksFromWalletAndDoesNotRatchetPrincipal() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);

        bytes memory pull = abi.encodeCall(IERC20.transfer, (address(this), 100 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, pull, 0);
        assertEq(distributor.eligiblePrincipal(tokenId), 1000 ether);
        assertEq(token.balanceOf(tba), 1000 ether);
        assertEq(arcade.spendable(tokenId), 0);

        token.approve(address(arcade), arcade.PLAY_COST());
        arcade.play(tokenId);

        assertEq(token.balanceOf(address(this)), 90 ether);
        assertEq(token.balanceOf(address(arcade)), arcade.PLAY_COST());
        assertEq(distributor.eligiblePrincipal(tokenId), 1000 ether);
        assertEq(token.balanceOf(tba), 1000 ether);
        assertEq(arcade.playsOf(tokenId), 1);
        uint8 mark = arcade.markOf(tokenId);
        assertGe(mark, arcade.MARK_HANDSHAKE());
        assertLe(mark, arcade.MARK_GOLD());
    }

    function testPlayRevertsIfNotInnerCircle() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        bytes memory drain = abi.encodeCall(IERC20.transfer, (address(this), 1000 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, drain, 0);
        assertEq(distributor.eligiblePrincipal(tokenId), 0);

        token.approve(address(arcade), arcade.PLAY_COST());
        vm.expectRevert("not inner circle");
        arcade.play(tokenId);
    }

    function testPlayRevertsIfNotOwner() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        address other = makeAddr("other");
        vm.prank(other);
        vm.expectRevert("not owner");
        arcade.play(tokenId);
    }

    function testPlayRevertsWithoutAllowance() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.expectRevert();
        arcade.play(tokenId);
    }

    function testPlayRevertsIfOverspendWallet() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        address broke = makeAddr("broke");
        nft.transferFrom(address(this), broke, tokenId);
        vm.startPrank(broke);
        token.approve(address(arcade), arcade.PLAY_COST());
        vm.expectRevert();
        arcade.play(tokenId);
        vm.stopPrank();
    }
}
