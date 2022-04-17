const { expect } = require("chai")
const { ethers } = require("hardhat")

let NFTMarketV2
let nftMarketV2

describe("NFTMarketV2", function () {
	beforeEach(async () => {
		NFTMarketV2 = await ethers.getContractFactory("NFTMarketV2")
		nftMarketV2 = await NFTMarketV2.deploy()
		await nftMarketV2.deployed()
	})

	it("getValue returns a value when initialize", async function () {
		const setValueTx = await nftMarketV2.initialize(200)

		// wait until the transaction is mined
		await setValueTx.wait()

		expect(await nftMarketV2.getValue()).to.equal(200)
	})

	it("test increment function", async function () {
		const incrementTx = await nftMarketV2.increment()

		// wait until the transaction is mined
		await incrementTx.wait()

		expect(await nftMarketV2.getValue()).to.equal(1)
	})
})
