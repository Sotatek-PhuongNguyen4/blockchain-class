const { expect } = require("chai")
const { ethers } = require("hardhat")

let NFTMarketV1
let nftMarketV1

describe("NFTMarketV1", function () {
	beforeEach(async () => {
		NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
		nftMarketV1 = await NFTMarketV1.deploy()
		await nftMarketV1.deployed()
	})

	it("getValue returns a value when initialize", async function () {
		const setValueTx = await nftMarketV1.initialize(200)

		// wait until the transaction is mined
		await setValueTx.wait()

		expect(await nftMarketV1.getValue()).to.equal(200)
	})
})
