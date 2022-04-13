require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const INFURA_API_KEY = process.env.INFURA_API_KEY

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY

module.exports = {
	solidity: "0.8.0",
	networks: {
		rinkeby: {
			url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
			accounts: [`${RINKEBY_PRIVATE_KEY}`],
		},
	},
	etherscan: {
		apiKey: ETHER_SCAN_API_KEY,
	},
}
