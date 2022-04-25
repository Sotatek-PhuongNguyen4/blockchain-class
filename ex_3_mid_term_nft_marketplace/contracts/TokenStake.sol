// SPDX-License-Identifier: UNLICENSED
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "./Token.sol";
// This is the main building block for smart contracts.
contract TokenStake is Token {
    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 totalSupply_) Token(name_, symbol_, decimals_, totalSupply_) {
    }

    mapping (address => bool) listMintableAddress;

    function setToMintable(address _address) public {
        listMintableAddress[_address] = true;
    }

    function removeFromMintable(address _address) public {
        listMintableAddress[_address] = false;
    }

    modifier mintable() {
        require(msg.sender == owner || listMintableAddress[msg.sender] == true);
        _;
    }

    function mint(address account, uint amount) public override mintable {
        require(account != address(0), "ERC20: mint to the zero address");
        balances[account] += amount;
        totalSupply += amount;
    }
}