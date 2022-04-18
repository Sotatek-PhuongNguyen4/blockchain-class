// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
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
    address treasury;
    uint256 fee;

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

     function setTreasury(address _treasury) public {
        treasury = _treasury;
    }

    function setFee(uint256 _fee) public {
        fee = _fee;
    }

    function matchOrder(uint256 _orderId) public {
        Order memory currentOrder = listOrders[_orderId];
        // require approve token
        require(IERC20(currentOrder.tokenAddress).allowance(msg.sender, address(this)) != 0, 'Token have to approve for marketplace');
        // require balance of buyer have to greater than price of NFT
        require(IERC20(currentOrder.tokenAddress).balanceOf(msg.sender) >= currentOrder.price, "Buyer's balance have to greater than or equal nft'price");
        // transfer NFT to buyer
        IERC721(currentOrder.collectionAddress).transferFrom(address(this), msg.sender, currentOrder.nftID);
        // tranfer token from buyer to treasury
        IERC20(currentOrder.tokenAddress).transferFrom(msg.sender, treasury, (currentOrder.price * (100 + fee) / 100));
        // transfer token from treasury to seller
        IERC20(currentOrder.tokenAddress).transferFrom(treasury, currentOrder.seller, (currentOrder.price * (100 - fee) / 100));
    }
}
