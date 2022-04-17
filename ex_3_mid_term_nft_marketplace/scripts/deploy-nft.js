const { ethers, upgrades } = require("hardhat")

async function main() {
	const MyNFT = await ethers.getContractFactory("MyNFT")
	const myNFT = await MyNFT.deploy()

	await myNFT.deployed()

	console.log("collection deployed to:", myNFT.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
