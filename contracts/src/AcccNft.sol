// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC6551Registry} from "./interfaces/IERC6551Registry.sol";

/// @dev Sequential public mint that skips reserved core IDs. Owner can mint a
/// specific ID to a wallet before (or during) public mint.
contract AcccNft is ERC721Enumerable {
    bytes32 public constant TBA_SALT = bytes32(0);

    IERC6551Registry public immutable registry;
    address public immutable tbaImplementation;
    address public owner;
    uint256 public nextId;
    bool public mintPaused = true;

    mapping(uint256 => bool) public reserved;
    mapping(uint256 => bool) public core;

    event OwnershipTransferred(address indexed previous, address indexed next);
    event MintPaused(bool paused);
    event CoreReserved(uint256 indexed tokenId, bool reserved);
    event Minted(address indexed to, uint256 indexed tokenId, address account);

    constructor(address registry_, address tbaImplementation_)
        ERC721("Anti-Cabal Cabal Club", "ACCC")
    {
        require(registry_ != address(0) && tbaImplementation_ != address(0), "zero address");
        registry = IERC6551Registry(registry_);
        tbaImplementation = tbaImplementation_;
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

    function setPaused(bool paused) external onlyOwner {
        mintPaused = paused;
        emit MintPaused(paused);
    }

    function available(uint256 tokenId) public view returns (bool) {
        return tokenId > 0 && _ownerOf(tokenId) == address(0) && !reserved[tokenId];
    }

    /// Hold an ID out of the public queue until owner mints it to a wallet.
    function reserve(uint256 tokenId, bool on) external onlyOwner {
        require(tokenId > 0, "bad id");
        require(_ownerOf(tokenId) == address(0), "minted");
        reserved[tokenId] = on;
        emit CoreReserved(tokenId, on);
    }

    /// Mint a specific ID to a wallet. Marks it core. Public mint will skip it.
    function mintTo(address to, uint256 tokenId) external onlyOwner returns (address account) {
        require(to != address(0), "zero to");
        require(tokenId > 0, "bad id");
        require(_ownerOf(tokenId) == address(0), "minted");
        reserved[tokenId] = false;
        core[tokenId] = true;
        account = _issue(to, tokenId);
    }

    function mint() external returns (uint256 tokenId, address account) {
        require(!mintPaused, "paused");
        tokenId = _nextPublicId();
        account = _issue(msg.sender, tokenId);
    }

    function accountOf(uint256 tokenId) public view returns (address) {
        return registry.account(
            tbaImplementation,
            TBA_SALT,
            block.chainid,
            address(this),
            tokenId
        );
    }

    function _nextPublicId() internal returns (uint256 tokenId) {
        uint256 start = nextId;
        while (true) {
            tokenId = ++nextId;
            require(tokenId < start + 500, "no id");
            if (available(tokenId)) return tokenId;
        }
    }

    function _issue(address to, uint256 tokenId) internal returns (address account) {
        _mint(to, tokenId);
        account = registry.createAccount(
            tbaImplementation,
            TBA_SALT,
            block.chainid,
            address(this),
            tokenId
        );
        emit Minted(to, tokenId, account);
    }
}
