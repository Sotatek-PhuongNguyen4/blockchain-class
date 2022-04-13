const { BigNumber } = require("ethers")

async function main() {
	const [deployer] = await ethers.getSigners()

	console.log("Deploying contracts with the account:", deployer.address)

	console.log("Account balance:", (await deployer.getBalance()).toString())

	const Token = await ethers.getContractFactory("Token")
	const token = await Token.deploy(
		"TESTTOKEN",
		"TTT",
		18,
		BigNumber.from("1000000000000000000000").toBigInt(),
		"0xD2C8DE021766f0409f880Fc1B3Bc0aA4A2c5FEA1"
	)

	console.log("Token address:", token.address)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
