const { ethers, upgrades } = require("hardhat")

async function main() {
	const NFTMarketV1 = await ethers.getContractFactory("NFTMarketV1")
	const nftMarketV1 = await upgrades.deployProxy(NFTMarketV1, [20])
	console.log("NFTMarketV1 deployed to:", nftMarketV1.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
