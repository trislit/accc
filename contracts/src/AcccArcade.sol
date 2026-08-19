// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AcccDistributor} from "./AcccDistributor.sol";
import {AcccNft} from "./AcccNft.sol";
import {AcccToken} from "./AcccToken.sol";

/// @dev Inner-circle cabinet. Genesis in the NFT Account unlocks the shop.
/// Games are free client-side. $ACCC buys wallpaper skins for the seat.
contract AcccArcade {
    uint256 public constant SKIN_COST = 10 * 1e18;
    uint8 public constant SKIN_MAX = 4;

    AcccNft public immutable nft;
    AcccDistributor public immutable distributor;
    AcccToken public immutable token;

    mapping(uint256 => uint8) public wallpaperOf;
    mapping(uint256 => uint256) public skinMask;

    event SkinBought(uint256 indexed tokenId, address indexed buyer, uint8 skinId);
    event SkinWorn(uint256 indexed tokenId, address indexed wearer, uint8 skinId);

    constructor(address nft_, address distributor_) {
        require(nft_ != address(0) && distributor_ != address(0), "zero address");
        nft = AcccNft(nft_);
        distributor = AcccDistributor(distributor_);
        require(address(distributor.nft()) == nft_, "nft mismatch");
        token = distributor.token();
    }

    function spendable(uint256 tokenId) public view returns (uint256) {
        uint256 principal = distributor.eligiblePrincipal(tokenId);
        uint256 bal = token.balanceOf(nft.accountOf(tokenId));
        return bal > principal ? bal - principal : 0;
    }

    function ownsSkin(uint256 tokenId, uint8 skinId) public view returns (bool) {
        if (skinId == 0) return true;
        if (skinId > SKIN_MAX) return false;
        return (skinMask[tokenId] & (1 << skinId)) != 0;
    }

    function buySkin(uint256 tokenId, uint8 skinId) external {
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(distributor.eligiblePrincipal(tokenId) > 0, "not inner circle");
        require(skinId >= 1 && skinId <= SKIN_MAX, "bad skin");
        require(!ownsSkin(tokenId, skinId), "owned");
        require(token.transferFrom(msg.sender, address(this), SKIN_COST), "pay");
        skinMask[tokenId] |= (1 << skinId);
        wallpaperOf[tokenId] = skinId;
        emit SkinBought(tokenId, msg.sender, skinId);
        emit SkinWorn(tokenId, msg.sender, skinId);
    }

    function wearSkin(uint256 tokenId, uint8 skinId) external {
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(ownsSkin(tokenId, skinId), "not owned");
        wallpaperOf[tokenId] = skinId;
        emit SkinWorn(tokenId, msg.sender, skinId);
    }
}
