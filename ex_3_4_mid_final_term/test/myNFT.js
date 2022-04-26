const { expect } = require("chai")
const { ethers } = require("hardhat")

let MyNFT
let myNFT

describe("MyNFT", function () {
	beforeEach(async () => {
		MyNFT = await ethers.getContractFactory("MyNFT")
		myNFT = await MyNFT.deploy()
		await myNFT.deployed()
	})

	it("test mintNFT", async function () {
		const [owner] = await ethers.getSigners()
		await myNFT.mintNFT(
			owner.address,
			"https://be.api.paceart.sotatek.works/api/v1/nfts/metadata/pace/31"
		)
		await expect(await myNFT.balanceOf(owner.address)).to.equal(1)
	})

	// it("add an error order to market place", async function () {
	// 	await nftMarketV1.createOrder(
	// 		"0x11adb3D685D380e3ab510CBf36Ee55dCe7ea2F2C",
	// 		5,
	// 		"0xc778417E063141139Fce010982780140Aa0cD5Ab",
	// 		1000000000
	// 	)
	// 	expect(await nftMarketV1.getCountOrder()).to.equal(0)
	// })
})
