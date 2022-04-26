const { ethers, upgrades } = require("hardhat")
require("dotenv").config(__dirname + "/../.env")

const PROXY_ADDRESS = process.env.PROXY_ADDRESS

console.log(PROXY_ADDRESS)

async function main() {
	// // // Upgrade
	const NFTMarketV3 = await ethers.getContractFactory("NFTMarketV3")
	const nftMarketV3 = await upgrades.upgradeProxy(PROXY_ADDRESS, NFTMarketV3)
	console.log("NFT Marketplace upgraded ", nftMarketV3.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
