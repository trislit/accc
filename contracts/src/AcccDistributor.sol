// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AcccNft} from "./AcccNft.sol";
import {AcccToken} from "./AcccToken.sol";

/// @dev One 1,000 $ACCC genesis grant per NFT. Yield is 10% APY on remaining
/// original principal only — withdrawals ratchet it down, deposits never restore it.
contract AcccDistributor {
    uint256 public constant GENESIS_AMOUNT = 1_000 * 1e18;
    uint256 public constant APR_WAD = 0.1e18;

    AcccNft public immutable nft;
    AcccToken public immutable token;

    mapping(uint256 => bool) public genesisClaimed;
    mapping(uint256 => uint256) public eligiblePrincipal;
    mapping(uint256 => uint256) public lastAccrual;
    mapping(uint256 => uint256) public accrued;
    mapping(address => uint256) public tbaToTokenId;

    event GenesisClaimed(uint256 indexed tokenId, address indexed tba, uint256 amount);
    event Harvested(uint256 indexed tokenId, address indexed tba, uint256 amount);

    constructor(address nft_) {
        require(nft_ != address(0), "zero nft");
        nft = AcccNft(nft_);
        token = new AcccToken(address(this));
    }

    function pendingYield(uint256 tokenId) public view returns (uint256) {
        if (!genesisClaimed[tokenId]) return 0;
        return accrued[tokenId] + _pendingSince(tokenId);
    }

    function claimGenesis(uint256 tokenId) external {
        nft.ownerOf(tokenId);
        require(!genesisClaimed[tokenId], "already claimed");
        address tba = nft.accountOf(tokenId);
        require(tba.code.length > 0, "no account");

        genesisClaimed[tokenId] = true;
        token.mint(tba, GENESIS_AMOUNT);

        tbaToTokenId[tba] = tokenId;
        eligiblePrincipal[tokenId] = GENESIS_AMOUNT;
        lastAccrual[tokenId] = block.timestamp;

        emit GenesisClaimed(tokenId, tba, GENESIS_AMOUNT);
    }

    function harvest(uint256 tokenId) external {
        require(genesisClaimed[tokenId], "not claimed");
        _accrue(tokenId);
        _ratchet(tokenId);

        uint256 amount = accrued[tokenId];
        accrued[tokenId] = 0;
        address tba = nft.accountOf(tokenId);
        if (amount > 0) {
            token.mint(tba, amount);
        }
        emit Harvested(tokenId, tba, amount);
    }

    function syncAccount(address account) external {
        require(msg.sender == address(token), "not token");
        uint256 tokenId = tbaToTokenId[account];
        if (tokenId == 0) return;
        _accrue(tokenId);
        _ratchet(tokenId);
    }

    function _pendingSince(uint256 tokenId) internal view returns (uint256) {
        uint256 principal = eligiblePrincipal[tokenId];
        if (principal == 0) return 0;
        uint256 elapsed = block.timestamp - lastAccrual[tokenId];
        if (elapsed == 0) return 0;
        return principal * APR_WAD * elapsed / 365 days / 1e18;
    }

    function _accrue(uint256 tokenId) internal {
        uint256 extra = _pendingSince(tokenId);
        if (extra > 0) {
            accrued[tokenId] += extra;
        }
        lastAccrual[tokenId] = block.timestamp;
    }

    function _ratchet(uint256 tokenId) internal {
        uint256 bal = token.balanceOf(nft.accountOf(tokenId));
        if (bal < eligiblePrincipal[tokenId]) {
            eligiblePrincipal[tokenId] = bal;
        }
    }
}
