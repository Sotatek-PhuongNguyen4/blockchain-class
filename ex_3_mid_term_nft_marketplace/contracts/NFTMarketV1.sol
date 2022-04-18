// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract NFTMarketV1 {
    struct Order {
        address seller;
        address collectionAddress;   
        uint256 nftID;
        address tokenAddress;
        uint256 price;   
    }

    // Mapping from orderID to Order
    uint256 countOrder;
    mapping (uint256 => Order) listOrders;

    function getCountOrder() public view returns (uint256) {
        return countOrder;
    } 

    function createOrder(address _collectionAddress, uint256 _nftID, address _tokenAddress, uint256 _price) public {
        // require owner of NFT
        require(IERC721(_collectionAddress).ownerOf(_nftID) == msg.sender, "NFT only transfer by it's owner");
        // require collection approved for proxy contract
        require(IERC721(_collectionAddress).isApprovedForAll(msg.sender, address(this)), "NFT have to approve for marketplace");
        // delegate call to transfer NFT to nftMarketplace
        IERC721(_collectionAddress).transferFrom(msg.sender, address(this), _nftID);
        // save order to blockchain
        Order memory newOrder = Order(msg.sender, _collectionAddress, _nftID, _tokenAddress, _price);
        listOrders[countOrder] = newOrder;
        countOrder++;
    }
}