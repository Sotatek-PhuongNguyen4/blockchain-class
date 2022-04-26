const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers, upgrades } = require("hardhat")

let NFTMarketV3
let nftMarketV3
let NFTMarketV1
let nftMarketV1
let MyNFT
let myNFT
let Token
let token
let TokenStake
let tokenStake
const metaDataURI =
	"https://be.api.paceart.sotatek.works/api/v1/nfts/metadata/pace/31"
const priceOrder = BigNumber.from("10000000000000").toBigInt()
const totalSupplyMinted = BigNumber.from("200000000000000").toBigInt()
const treasuryAddress = "0xDBA77eb478285ae2518056F785eF6190a2B3185C"
const fee = 25

describe("NFTMarketV3", function () {
	beforeEach(async () => {
		NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
		nftMarketV1 = await upgrades.deployProxy(NFTMarketV1)

		NFTMarketV3 = await ethers.getContractFactory("NFTMarketV3")
		nftMarketV3 = await upgrades.upgradeProxy(
			nftMarketV1.address,
			NFTMarketV3
		)

		MyNFT = await ethers.getContractFactory("MyNFT")
		myNFT = await MyNFT.deploy()
		await myNFT.deployed()

		Token = await ethers.getContractFactory("Token")
		token = await Token.deploy(
			"TESTTOKEN",
			"TTT",
			18,
			BigInt("1000000000000000000000")
		)
		await token.deployed()

		TokenStake = await ethers.getContractFactory("TokenStake")
		tokenStake = await TokenStake.deploy(
			"STAKETOKEN",
			"STT",
			18,
			BigInt("1000000000000000000000")
		)
		await tokenStake.deployed()
		await tokenStake.setToMintable(nftMarketV3.address)
	})

	it("getCountOrder returns 0 when initialize", async function () {
		expect(await nftMarketV3.getCountOrder()).to.equal(0)
	})

	it("test set and get fee", async function () {
		await nftMarketV3.setFee(10)
		expect(await nftMarketV3.getFee()).to.equal(10)
	})

	it("test set and get treasury address", async function () {
		await nftMarketV3.setTreasury(treasuryAddress)
		expect(await nftMarketV3.getTreasury()).to.equal(treasuryAddress)
	})

	it("add an order to market place", async function () {
		const [owner] = await ethers.getSigners()

		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)
		expect(await nftMarketV3.getCountOrder()).to.equal(1)
	})

	it("test order existed", async function () {
		const [owner, treasury, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)
		expect(await nftMarketV3.isOrderExists(0)).to.equal(true)
	})

	it("test match an order", async function () {
		const [owner, treasury, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await nftMarketV3.setTreasury(treasury.address)
		await nftMarketV3.setFee(fee)

		await token.mint(buyer.address, totalSupplyMinted)

		await token
			.connect(buyer)
			.approve(nftMarketV3.address, totalSupplyMinted)
		await token
			.connect(treasury)
			.approve(nftMarketV3.address, totalSupplyMinted)

		await nftMarketV3.connect(buyer).matchOrder(0)

		expect(await nftMarketV3.isOrderExists(0)).to.equal(false)
	})

	it("add an order not NFT'owner to market place", async function () {
		const [owner, add1] = await ethers.getSigners()

		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, true)
		await expect(
			nftMarketV1
				.connect(add1)
				.createOrder(myNFT.address, 1, token.address, priceOrder)
		).to.be.reverted
	})

	it("add an order not approve NFT to market place", async function () {
		const [owner] = await ethers.getSigners()

		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, false)
		await expect(
			nftMarketV1.createOrder(myNFT.address, 1, token.address, priceOrder)
		).to.be.reverted
	})

	it("match an order not existing", async function () {
		await expect(nftMarketV3.matchOrder(0)).to.be.reverted
	})

	it("match an order marketplace not approve token erc20", async function () {
		const [owner, treasury, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await nftMarketV3.setTreasury(treasury.address)
		await nftMarketV3.setFee(fee)

		await token.mint(buyer.address, totalSupplyMinted)

		await expect(nftMarketV3.connect(buyer).matchOrder(0)).to.be.reverted
	})

	it("match an order buyer not enough token erc20", async function () {
		const [owner, treasury, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await nftMarketV3.setTreasury(treasury.address)
		await nftMarketV3.setFee(fee)

		await token.mint(buyer.address, priceOrder)

		await token
			.connect(buyer)
			.approve(nftMarketV3.address, totalSupplyMinted)

		await expect(nftMarketV3.connect(buyer).matchOrder(0)).to.be.reverted
	})

	it("getCollateralCounter returns 0 when initialize", async function () {
		expect(await nftMarketV3.getCollateralCounter()).to.equal(0)
	})

	it("test list as collateral", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)

		expect(await nftMarketV3.getCollateralCounter()).to.equal(1)
	})

	it("test list as collateral not owner", async function () {
		const [owner, account] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await expect(
			nftMarketV3.connect(account).listAsCollateral(myNFT.address, 1)
		).to.be.reverted
	})

	it("test set hashrate for collateral ID", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await nftMarketV3.setHashrate(0, 15)
		expect((await nftMarketV3.getNFTCollateral(0)).hashrate).to.equal(15)
	})

	it("test set hashrate not owner", async function () {
		const [owner, add] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await expect(nftMarketV3.connect(add).setHashrate(0, 15)).to.be.reverted
	})

	it("test set nagative hashrate for collateral ID", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await expect(nftMarketV3.setHashrate(0, -1)).to.be.reverted
	})

	it("test set base price for collateral ID", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await nftMarketV3.setBaseAPRPrice(priceOrder)

		expect(await nftMarketV3.getBaseAPRPrice()).to.equal(priceOrder)
	})

	it("test set invalid base price for collateral ID", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await expect(nftMarketV3.setBaseAPRPrice(-1)).to.be.reverted
	})

	it("test set  rewards token", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)

		await nftMarketV3.setRewardsToken(tokenStake.address)

		expect(await nftMarketV3.getRewardsToken()).to.equal(tokenStake.address)
	})

	it("Set owner", async function () {
		const [owner, add1] = await ethers.getSigners()
		await nftMarketV3.setOwner(add1.address)
		expect(await nftMarketV3.getOwner()).to.equal(add1.address)
	})

	it("Set owner twice", async function () {
		const [owner, add1, add2] = await ethers.getSigners()
		await nftMarketV3.setOwner(add1.address)
		await expect(nftMarketV3.setOwner(add2.address)).to.be.reverted
	})

	it("Staking NFT", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)
		await nftMarketV3.setBaseAPRPrice(priceOrder)
		await nftMarketV3.setRewardsToken(tokenStake.address)
		await nftMarketV3.setHashrate(0, 15)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.stake(0)
		expect(await myNFT.ownerOf(1)).to.equal(nftMarketV3.address)
	})

	it("Staking not owner NFT", async function () {
		const [owner, add1] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await expect(nftMarketV3.connect(add1).stake(0)).to.be.reverted
	})

	it("Staking not owner approve NFT", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)
		await nftMarketV3.setBaseAPRPrice(priceOrder)
		await nftMarketV3.setRewardsToken(tokenStake.address)
		await nftMarketV3.setHashrate(0, 15)
		await expect(nftMarketV3.stake(0)).to.be.reverted
	})

	it("UnStaking NFT", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await nftMarketV3.listAsCollateral(myNFT.address, 1)
		await nftMarketV3.setOwner(owner.address)
		await nftMarketV3.setBaseAPRPrice(priceOrder)
		await nftMarketV3.setRewardsToken(tokenStake.address)
		await nftMarketV3.setHashrate(0, 15)
		await myNFT.setApprovalForAll(nftMarketV3.address, true)
		await nftMarketV3.stake(0)
		await nftMarketV3.unStake(0)
		expect(await myNFT.ownerOf(1)).to.equal(owner.address)
	})

	it("UnStaking invalid NFT", async function () {
		const [owner] = await ethers.getSigners()
		await expect(nftMarketV3.unStake(0)).to.be.reverted
	})
})
