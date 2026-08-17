// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC6551Account} from "../src/ERC6551Account.sol";
import {ERC6551Registry} from "../src/ERC6551Registry.sol";
import {AcccDistributor} from "../src/AcccDistributor.sol";
import {AcccNft} from "../src/AcccNft.sol";
import {AcccToken} from "../src/AcccToken.sol";

contract AcccTbaTest is Test {
    ERC6551Registry internal registry;
    ERC6551Account internal implementation;
    AcccNft internal nft;
    AcccDistributor internal distributor;
    AcccToken internal token;
    address internal user = makeAddr("user");

    receive() external payable {}

    function setUp() public {
        registry = new ERC6551Registry();
        implementation = new ERC6551Account();
        nft = new AcccNft(address(registry), address(implementation));
        distributor = new AcccDistributor(address(nft));
        token = distributor.token();
    }

    function testMintCreatesTba() public {
        (uint256 tokenId, address tba) = nft.mint();
        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), address(this));
        assertGt(tba.code.length, 0);
        assertEq(tba, nft.accountOf(tokenId));
        assertEq(ERC6551Account(payable(tba)).owner(), address(this));
        (uint256 chainId, address tokenContract, uint256 boundId) =
            ERC6551Account(payable(tba)).token();
        assertEq(chainId, block.chainid);
        assertEq(tokenContract, address(nft));
        assertEq(boundId, tokenId);
    }

    function testDepositAndWithdrawToken() public {
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);
        assertEq(token.balanceOf(tba), 1000 ether);

        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 40 ether));
        ERC6551Account(payable(tba)).execute(address(token), 0, data, 0);

        assertEq(token.balanceOf(tba), 960 ether);
        assertEq(token.balanceOf(address(this)), 40 ether);
    }

    function testEthDepositAndWithdraw() public {
        (, address tba) = nft.mint();
        vm.deal(address(this), 1 ether);
        (bool ok,) = tba.call{value: 0.5 ether}("");
        assertTrue(ok);
        assertEq(tba.balance, 0.5 ether);

        ERC6551Account(payable(tba)).execute(address(this), 0.2 ether, "", 0);
        assertEq(tba.balance, 0.3 ether);
    }

    function testNonOwnerCannotWithdraw() public {
        vm.prank(user);
        (uint256 tokenId, address tba) = nft.mint();
        distributor.claimGenesis(tokenId);

        bytes memory data = abi.encodeCall(IERC20.transfer, (address(this), 10 ether));
        vm.expectRevert("Invalid signer");
        ERC6551Account(payable(tba)).execute(address(token), 0, data, 0);
    }

    function testSecondMintGetsOwnAccount() public {
        (uint256 firstId, address firstTba) = nft.mint();
        (uint256 secondId, address secondTba) = nft.mint();
        assertEq(firstId, 1);
        assertEq(secondId, 2);
        assertTrue(firstTba != secondTba);
        assertEq(nft.balanceOf(address(this)), 2);
        assertEq(nft.tokenOfOwnerByIndex(address(this), 0), 1);
        assertEq(nft.tokenOfOwnerByIndex(address(this), 1), 2);
    }
}
