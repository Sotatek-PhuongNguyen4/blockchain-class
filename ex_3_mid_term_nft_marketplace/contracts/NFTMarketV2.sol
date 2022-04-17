//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract NFTMarketV2 {
    uint256 private value;

    event NewValue(uint256 new_value);

    function initialize(uint256 _value) external {
        value = _value;
        emit NewValue(_value);
    }

    function getValue () public view returns (uint256) {
        return value;
    }

    function increment() public {
        value += 1;
        emit NewValue(value);
    }
}