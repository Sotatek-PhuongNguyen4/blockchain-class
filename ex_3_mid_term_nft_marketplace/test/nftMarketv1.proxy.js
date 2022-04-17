const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

let NFTMarketV1
let nftMarketV1

describe("NFTMarketV1 (proxy)", function () {
	beforeEach(async () => {
		NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
		nftMarketV1 = await upgrades.deployProxy(NFTMarketV1, [20])
	})

	it("getValue returns a value when initialize", async function () {
		expect(await nftMarketV1.getValue()).to.equal(20)
	})
})
