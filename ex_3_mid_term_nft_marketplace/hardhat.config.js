require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("@openzeppelin/hardhat-upgrades")
require("solidity-coverage")
require("dotenv").config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const INFURA_API_KEY = process.env.INFURA_API_KEY
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	solidity: "0.8.4",
	networks: {
		rinkeby: {
			url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
			accounts: [`${DEPLOYER_PRIVATE_KEY}`],
			gas: 2100000,
			gasPrice: 8000000000,
			chainId: 4,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
}
