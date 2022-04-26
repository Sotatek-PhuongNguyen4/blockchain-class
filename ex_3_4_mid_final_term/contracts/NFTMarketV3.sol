// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";


interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function mint(address account, uint amount) external;
    function transfer(address to, uint256 amount) external;
}

contract NFTMarketV3 {
    struct Order {
        address seller;
        address collectionAddress;   
        uint256 nftID;
        address tokenAddress;
        uint256 price;  
        bool existed;  
    }

    // Mapping from orderID to Order
    uint256 countOrder;
    mapping (uint256 => Order) listOrders;
    address treasury;
    uint256 fee;

    // v3 variable state
    address _owner;
    struct NFTCollateral {
        address owner;
        address collectionAddress;
        uint256 nftID;
        uint256 hashrate;
        uint256 lastStakingTime;
        bool isStaking;
    }
    uint256 collateralCounter;
    mapping (uint256 => NFTCollateral) listNFTCollaterals;
    uint256 baseAPRPrice;
    address rewardsToken;

    // end v3 variable state

    function getCountOrder() public view returns (uint256) {
        return countOrder;
    } 

    function createOrder(address _collectionAddress, uint256 _nftID, address _tokenAddress, uint256 _price) public returns(uint256) {
        // require owner of NFT
        require(IERC721(_collectionAddress).ownerOf(_nftID) == msg.sender, "NFT only transfer by it owner");
        // require collection approved for proxy contract
        require(IERC721(_collectionAddress).isApprovedForAll(msg.sender, address(this)), "NFT have to approve for marketplace");
        // delegate call to transfer NFT to nftMarketplace
        IERC721(_collectionAddress).transferFrom(msg.sender, address(this), _nftID);
        // save order to blockchain
        Order memory newOrder = Order(msg.sender, _collectionAddress, _nftID, _tokenAddress, _price, true);
        listOrders[countOrder] = newOrder;
        countOrder++;
        return  countOrder - 1;
    }

    function setTreasury(address _treasury) public {
        treasury = _treasury;
    }

    function getTreasury() view public returns (address){
        return treasury;
    }

    function setFee(uint256 _fee) public {
        fee = _fee;
    }

    function getFee() view public returns (uint256){
        return fee;
    }

    function isOrderExists(uint256 key) public view returns (bool) {
        return listOrders[key].existed;
    }

    function matchOrder(uint256 _orderId) public {   
        require(isOrderExists(_orderId), "Order is not existing!");    
        Order memory currentOrder = listOrders[_orderId];  
        // require approve token
        require(IERC20(currentOrder.tokenAddress).allowance(msg.sender, address(this)) != 0, 'Token have to approve for marketplace');
        // require balance of buyer have to greater than price of NFT
        require(IERC20(currentOrder.tokenAddress).balanceOf(msg.sender) >= (currentOrder.price * (100 + fee) / 100), "Buyer's balance is not enough");
        // transfer NFT to buyer
        IERC721(currentOrder.collectionAddress).transferFrom(address(this), msg.sender, currentOrder.nftID);
        // tranfer token from buyer to treasury
        IERC20(currentOrder.tokenAddress).transferFrom(msg.sender, treasury, (currentOrder.price * (100 + fee) / 100));
        // transfer token from treasury to seller
        IERC20(currentOrder.tokenAddress).transferFrom(treasury, currentOrder.seller, (currentOrder.price * (100 - fee) / 100));
        // order executed
        listOrders[_orderId].existed = false;
    }


    // v3 function
    function setOwner(address _address) public {
        require(_owner == address(0), "Owner to be set have to zero address");
        _owner = _address;
    }

    function getOwner() view public returns(address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function getCollateralCounter() public view returns (uint256) {
        return collateralCounter;
    } 

    function getNFTCollateral(uint256 _collateralId) view public returns (NFTCollateral memory) {
        return listNFTCollaterals[_collateralId];
    }

    function listAsCollateral(address _collectionAddress, uint256 _nftID) public returns(uint256) {
        // require owner of NFT
        require(IERC721(_collectionAddress).ownerOf(_nftID) == msg.sender, "NFT only list as collateral by it owner");
        // save collateral to blockchain
        NFTCollateral memory newNFTCollateral = NFTCollateral(msg.sender, _collectionAddress, _nftID, 0, block.timestamp, false);
        listNFTCollaterals[collateralCounter] = newNFTCollateral;
        collateralCounter++;
        return  collateralCounter - 1;
    }

    function setHashrate(uint256 _collateralID, uint256 _hashrate) public onlyOwner {
        require(_hashrate > 0, "Hashrate have to greater than zero");
        NFTCollateral storage nftCollateral = listNFTCollaterals[_collateralID];
        nftCollateral.hashrate = _hashrate;
    }

    function setBaseAPRPrice(uint256 _price) public onlyOwner {
        require(_price > 0, "base APR price have to greater than 0");
        baseAPRPrice = _price;
    }

    function getBaseAPRPrice() view public returns (uint256) {
        return baseAPRPrice;
    }

    function setRewardsToken(address _tokenAddress) public onlyOwner {
        rewardsToken = _tokenAddress;
    }

    function getRewardsToken() public view returns (address) {
        return rewardsToken;
    }

    function stake(uint256 _collateralID) public {
        // require collateralID suitable
        NFTCollateral storage nftCollateral = listNFTCollaterals[_collateralID];
        // require msg.sender is onwer of NFT
        require(IERC721(nftCollateral.collectionAddress).ownerOf(nftCollateral.nftID) == msg.sender, "NFT only stake by it owner");
        require(IERC721(nftCollateral.collectionAddress).isApprovedForAll(msg.sender, address(this)), "NFT have to approve for marketplace");
        // delegate call to transfer NFT to nftMarketplace
        IERC721(nftCollateral.collectionAddress).transferFrom(msg.sender, address(this), nftCollateral.nftID);
        nftCollateral.lastStakingTime = block.timestamp;
        nftCollateral.isStaking = true;
    }

    function unStake(uint256 _collateralID) public {
         // require collateralID suitable
        NFTCollateral memory nftCollateral = listNFTCollaterals[_collateralID];
        require(nftCollateral.hashrate > 0, "Collateral ID is invalid");
         // require msg.sender is onwer of NFT
        // calculate total repayment
        uint256 totalRepayment = (block.timestamp - nftCollateral.lastStakingTime) * nftCollateral.hashrate * baseAPRPrice;
        // mint token
        IERC20(rewardsToken).mint(address(this), totalRepayment);
        // transfer token from address this to msg.sender
        IERC20(rewardsToken).transfer(msg.sender, totalRepayment);
        // transfer NFT to msg.sender
        IERC721(nftCollateral.collectionAddress).transferFrom(address(this), msg.sender, nftCollateral.nftID);
    }

    // end v3 function

}
