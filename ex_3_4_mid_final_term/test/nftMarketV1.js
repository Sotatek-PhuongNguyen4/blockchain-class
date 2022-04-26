const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { ethers, upgrades } = require("hardhat")

let NFTMarketV1
let nftMarketV1
let MyNFT
let myNFT
let Token
let token
const metaDataURI =
	"https://be.api.paceart.sotatek.works/api/v1/nfts/metadata/pace/31"
const priceOrder = BigNumber.from("10000000000000").toBigInt()
const balanceBuyer = BigNumber.from("1000000000000").toBigInt()
const totalSupplyMinted = BigNumber.from("200000000000000").toBigInt()

describe("NFTMarketV1", function () {
	beforeEach(async () => {
		NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
		nftMarketV1 = await upgrades.deployProxy(NFTMarketV1)

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
	})

	it("getCountOrder returns 0 when initialize", async function () {
		expect(await nftMarketV1.getCountOrder()).to.equal(0)
	})

	it("add an order to market place", async function () {
		const [owner] = await ethers.getSigners()

		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, true)
		await nftMarketV1.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)
		expect(await nftMarketV1.getCountOrder()).to.equal(1)
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
		await expect(nftMarketV1.matchOrder(0)).to.be.reverted
	})

	it("match an order marketplace not approve token erc20", async function () {
		const [owner, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, true)
		await nftMarketV1.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await token.mint(buyer.address, totalSupplyMinted)

		await expect(nftMarketV1.connect(buyer).matchOrder(0)).to.be.reverted
	})

	it("match an order buyer not enough token erc20", async function () {
		const [owner, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, true)
		await nftMarketV1.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await token.mint(buyer.address, balanceBuyer)

		await token
			.connect(buyer)
			.approve(nftMarketV1.address, totalSupplyMinted)

		await expect(nftMarketV1.connect(buyer).matchOrder(0)).to.be.reverted
	})

	it("test match an order", async function () {
		const [owner, buyer] = await ethers.getSigners()
		await myNFT.mintNFT(owner.address, metaDataURI)
		await myNFT.setApprovalForAll(nftMarketV1.address, true)
		await nftMarketV1.createOrder(
			myNFT.address,
			1,
			token.address,
			priceOrder
		)

		await token.mint(buyer.address, totalSupplyMinted)

		await token
			.connect(buyer)
			.approve(nftMarketV1.address, totalSupplyMinted)

		await nftMarketV1.connect(buyer).matchOrder(0)

		expect(await nftMarketV1.isOrderExists(0)).to.equal(false)
	})
})
