// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AcccDistributor} from "./AcccDistributor.sol";
import {AcccNft} from "./AcccNft.sol";
import {AcccToken} from "./AcccToken.sol";

/// @dev Inner-circle cabinet. Genesis principal in the NFT Account unlocks play.
/// Harvested / wallet $ACCC is sunk here for a cosmetic mark — never more $ACCC.
contract AcccArcade {
    uint256 public constant PLAY_COST = 10 * 1e18;
    uint8 public constant MARK_NONE = 0;
    uint8 public constant MARK_HANDSHAKE = 1;
    uint8 public constant MARK_SILVER = 2;
    uint8 public constant MARK_GOLD = 3;

    AcccNft public immutable nft;
    AcccDistributor public immutable distributor;
    AcccToken public immutable token;

    mapping(uint256 => uint8) public markOf;
    mapping(uint256 => uint256) public playsOf;

    event Played(
        uint256 indexed tokenId,
        address indexed player,
        uint8 mark,
        uint256 plays
    );

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

    function play(uint256 tokenId) external {
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(distributor.eligiblePrincipal(tokenId) > 0, "not inner circle");
        require(token.transferFrom(msg.sender, address(this), PLAY_COST), "pay");

        uint256 plays = ++playsOf[tokenId];
        uint8 mark = _roll(tokenId, plays);
        markOf[tokenId] = mark;
        emit Played(tokenId, msg.sender, mark, plays);
    }

    function _roll(uint256 tokenId, uint256 plays) internal view returns (uint8) {
        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.timestamp, tokenId, plays, msg.sender)
            )
        );
        uint256 bucket = rand % 100;
        if (bucket < 10) return MARK_GOLD;
        if (bucket < 40) return MARK_SILVER;
        return MARK_HANDSHAKE;
    }
}
