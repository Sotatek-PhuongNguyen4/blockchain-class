const { ethers, upgrades } = require("hardhat")
require("dotenv").config(__dirname + "/../.env")

const PROXY_ADDRESS = process.env.PROXY_ADDRESS

console.log(PROXY_ADDRESS)

async function main() {
	// // // Upgrade
	const NFTMarketV2 = await ethers.getContractFactory("NFTMarketV2")
	const nftMarketV2 = await upgrades.upgradeProxy(PROXY_ADDRESS, NFTMarketV2)
	console.log("NFT Marketplace upgraded ", nftMarketV2.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
