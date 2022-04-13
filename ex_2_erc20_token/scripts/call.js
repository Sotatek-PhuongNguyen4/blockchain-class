const ethers = require("ethers")

require("dotenv").config({ path: __dirname + "/../.env" })

const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY

const token_abi = require("../data/token.json")
const provider = new ethers.providers.InfuraProvider("rinkeby")

const target_address = "0xD2C8DE021766f0409f880Fc1B3Bc0aA4A2c5FEA1"
const contract_address = "0xBB1087A23cFDA180a3428181252AF333aA530B35"

async function mint(amount) {
	// create signer object from it's private key to connect to network
	const wallet = new ethers.Wallet(RINKEBY_PRIVATE_KEY)
	// inject provider to signer to sign message and execute txn
	const signer = wallet.connect(provider)
	const contract = new ethers.Contract(contract_address, token_abi, signer)
	let numberOfTokens = ethers.utils.parseUnits(amount, 18)
	try {
		const mintResult = await contract.mint(target_address, numberOfTokens)
		if (mintResult) {
			console.log("mint done")
		}
	} catch (error) {
		console.log("mint fail")
	}
}

async function burn(amount) {
	// create signer object from it's private key to connect to network
	const wallet = new ethers.Wallet(RINKEBY_PRIVATE_KEY)
	// inject provider to signer to sign message and execute txn
	const signer = wallet.connect(provider)
	const contract = new ethers.Contract(contract_address, token_abi, signer)
	let numberOfTokens = ethers.utils.parseUnits(amount, 18)
	try {
		const burnResult = await contract.burn(target_address, numberOfTokens)
		if (burnResult) {
			console.log("burn done")
		}
	} catch (error) {
		console.log("burn fail")
	}
}

async function addToBlackList(address) {
	// create signer object from it's private key to connect to network
	const wallet = new ethers.Wallet(RINKEBY_PRIVATE_KEY)
	// inject provider to signer to sign message and execute txn
	const signer = wallet.connect(provider)
	const contract = new ethers.Contract(contract_address, token_abi, signer)

	try {
		const result = await contract.addToBlackList(address)
		if (result) {
			console.log("add to blacklist done")
		}
	} catch (error) {
		console.log("add to blacklist fail")
	}
}

async function removeFromBlackList(address) {
	// create signer object from it's private key to connect to network
	const wallet = new ethers.Wallet(RINKEBY_PRIVATE_KEY)
	// inject provider to signer to sign message and execute txn
	const signer = wallet.connect(provider)
	const contract = new ethers.Contract(contract_address, token_abi, signer)

	try {
		const result = await contract.removeFromBlackList(address)
		if (result) {
			console.log("remove from blacklist done")
		}
	} catch (error) {
		console.log("remove from blacklist fail")
	}
}

// mint("100")
// burn("200")
// addToBlackList("0xD2C8DE021766f0409f880Fc1B3Bc0aA4A2c5FEA1")
// removeFromBlackList("0xD2C8DE021766f0409f880Fc1B3Bc0aA4A2c5FEA1")
