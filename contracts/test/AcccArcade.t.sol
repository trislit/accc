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
        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);
        assertEq(arcade.spendable(tokenId), 100 ether);
    }

    function testBuySkinSinksFromWalletAndDoesNotRatchet() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);
        bytes memory pull = abi.encodeCall(IERC20.transfer, (address(this), 100 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, pull, 0);

        token.approve(address(arcade), arcade.SKIN_COST());
        arcade.buySkin(tokenId, 1);

        assertEq(token.balanceOf(address(arcade)), arcade.SKIN_COST());
        assertEq(distributor.eligiblePrincipal(tokenId), 1000 ether);
        assertEq(token.balanceOf(tba), 1000 ether);
        assertEq(arcade.wallpaperOf(tokenId), 1);
        assertTrue(arcade.ownsSkin(tokenId, 1));
        assertTrue(arcade.ownsSkin(tokenId, 0));
    }

    function testWearOwnedSkin() public {
        (uint256 tokenId,) = _seatWithChips();
        token.approve(address(arcade), arcade.SKIN_COST() * 2);
        arcade.buySkin(tokenId, 1);
        arcade.buySkin(tokenId, 2);
        arcade.wearSkin(tokenId, 1);
        assertEq(arcade.wallpaperOf(tokenId), 1);
        arcade.wearSkin(tokenId, 0);
        assertEq(arcade.wallpaperOf(tokenId), 0);
    }

    function testBuySkinRevertsIfNotInnerCircle() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        bytes memory drain = abi.encodeCall(IERC20.transfer, (address(this), 1000 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, drain, 0);
        token.approve(address(arcade), arcade.SKIN_COST());
        vm.expectRevert("not inner circle");
        arcade.buySkin(tokenId, 1);
    }

    function testBuySkinRevertsIfNotOwner() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.prank(makeAddr("other"));
        vm.expectRevert("not owner");
        arcade.buySkin(tokenId, 1);
    }

    function testBuySkinRevertsIfAlreadyOwned() public {
        (uint256 tokenId,) = _seatWithChips();
        token.approve(address(arcade), arcade.SKIN_COST() * 2);
        arcade.buySkin(tokenId, 1);
        vm.expectRevert("owned");
        arcade.buySkin(tokenId, 1);
    }

    function testWearUnownedSkinReverts() public {
        (uint256 tokenId,) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.expectRevert("not owned");
        arcade.wearSkin(tokenId, 2);
    }

    function _seatWithChips() internal returns (uint256 tokenId, address tba) {
        (tokenId, tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        vm.warp(block.timestamp + 365 days);
        distributor.harvest(tokenId);
        bytes memory pull = abi.encodeCall(IERC20.transfer, (address(this), 100 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, pull, 0);
    }
}
