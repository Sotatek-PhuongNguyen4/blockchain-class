const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

let NFTMarketV2
let nftMarketV2
let NFTMarketV1
let nftMarketV1

describe("NFTMarketV2", function () {
	beforeEach(async () => {
		NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
		nftMarketV1 = await upgrades.deployProxy(NFTMarketV1, [20])

		NFTMarketV2 = await ethers.getContractFactory("NFTMarketV2")
		nftMarketV2 = await upgrades.upgradeProxy(
			nftMarketV1.address,
			NFTMarketV2
		)
	})

	it("getValue returns a value previously incremented", async function () {
		const incrementTx = await nftMarketV2.increment()

		// wait until the transaction is mined
		await incrementTx.wait()

		expect(await nftMarketV2.getValue()).to.equal(21)
	})
})
