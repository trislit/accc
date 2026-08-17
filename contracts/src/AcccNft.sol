// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC6551Registry} from "./interfaces/IERC6551Registry.sol";

contract AcccNft is ERC721Enumerable {
    bytes32 public constant TBA_SALT = bytes32(0);

    IERC6551Registry public immutable registry;
    address public immutable tbaImplementation;
    uint256 public nextId;

    event Minted(address indexed to, uint256 indexed tokenId, address account);

    constructor(address registry_, address tbaImplementation_)
        ERC721("Anti-Cabal Cabal Club", "ACCC")
    {
        require(registry_ != address(0) && tbaImplementation_ != address(0), "zero address");
        registry = IERC6551Registry(registry_);
        tbaImplementation = tbaImplementation_;
    }

    function mint() external returns (uint256 tokenId, address account) {
        tokenId = ++nextId;
        _mint(msg.sender, tokenId);
        account = registry.createAccount(
            tbaImplementation,
            TBA_SALT,
            block.chainid,
            address(this),
            tokenId
        );
        emit Minted(msg.sender, tokenId, account);
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
}
