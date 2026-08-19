// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AcccNft} from "./AcccNft.sol";
import {AcccToken} from "./AcccToken.sol";

/// @dev One genesis grant per NFT. Default is 1,000 $ACCC. Owner can reserve a
/// larger grant on unclaimed token IDs (including the next mints). Yield is 10%
/// APY on remaining original principal — withdrawals ratchet it down, deposits
/// never restore it. The grant travels with the NFT.
contract AcccDistributor {
    uint256 public constant GENESIS_AMOUNT = 1_000 * 1e18;
    uint256 public constant APR_WAD = 0.1e18;

    AcccNft public immutable nft;
    AcccToken public immutable token;
    address public owner;

    mapping(uint256 => bool) public genesisClaimed;
    mapping(uint256 => uint256) public eligiblePrincipal;
    mapping(uint256 => uint256) public lastAccrual;
    mapping(uint256 => uint256) public accrued;
    mapping(address => uint256) public tbaToTokenId;
    mapping(uint256 => uint256) public reservedGrant;

    event OwnershipTransferred(address indexed previous, address indexed next);
    event GrantReserved(uint256 indexed tokenId, uint256 amount);
    event GenesisClaimed(uint256 indexed tokenId, address indexed tba, uint256 amount);
    event Harvested(uint256 indexed tokenId, address indexed tba, uint256 amount);

    constructor(address nft_) {
        require(nft_ != address(0), "zero nft");
        nft = AcccNft(nft_);
        token = new AcccToken(address(this));
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero owner");
        emit OwnershipTransferred(owner, next);
        owner = next;
    }

    function grantOf(uint256 tokenId) public view returns (uint256) {
        uint256 reserved = reservedGrant[tokenId];
        return reserved == 0 ? GENESIS_AMOUNT : reserved;
    }

    function isSpecial(uint256 tokenId) public view returns (bool) {
        return grantOf(tokenId) > GENESIS_AMOUNT;
    }

    /// Reserve a grant for an unclaimed token. Use GENESIS_AMOUNT to clear a special.
    function setGrant(uint256 tokenId, uint256 amount) external onlyOwner {
        require(!genesisClaimed[tokenId], "claimed");
        require(amount >= GENESIS_AMOUNT, "below default");
        reservedGrant[tokenId] = amount == GENESIS_AMOUNT ? 0 : amount;
        emit GrantReserved(tokenId, grantOf(tokenId));
    }

    /// Mark the next available public mint IDs as special. Skips reserved cores.
    function seedNextMints(uint256 amount, uint256 count) external onlyOwner {
        require(amount > GENESIS_AMOUNT, "not special");
        require(count > 0 && count <= 20, "bad count");
        uint256 id = nft.nextId();
        uint256 seeded;
        while (seeded < count) {
            id++;
            require(id < nft.nextId() + 500, "no id");
            if (!nft.available(id)) continue;
            require(!genesisClaimed[id], "claimed");
            reservedGrant[id] = amount;
            emit GrantReserved(id, amount);
            seeded++;
        }
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

        uint256 amount = grantOf(tokenId);
        genesisClaimed[tokenId] = true;
        token.mint(tba, amount);

        tbaToTokenId[tba] = tokenId;
        eligiblePrincipal[tokenId] = amount;
        lastAccrual[tokenId] = block.timestamp;

        emit GenesisClaimed(tokenId, tba, amount);
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
