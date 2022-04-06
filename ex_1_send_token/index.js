require('dotenv').config()
const ethers = require('ethers')

const NETWORK = process.env.NETWORK

// provider is a object which help to connect to the Ethereum Network. 
// It provides read-only access to the Blockchain and its status.
const provider = new ethers.providers.InfuraProvider(NETWORK)

const sendTransaction = async (senderAddress, receiverAddress, amountToken, privateKeyOfSender) => {
    // create signer object from it's private key to connect to network
    const wallet = new ethers.Wallet(privateKeyOfSender)


    // inject provider to signer to sign message and execute txn
    const signer = wallet.connect(provider)
    
    
    // get getPrice for tx - BigNumber
    const gasPriceBigNumber =  await provider.getGasPrice()
   
    const gasPriceHex = gasPriceBigNumber.toHexString()

    // define gas limit
    const  gasLimit = "0x100000"

    // define input of sendTransaction
    const tx = {
        from: senderAddress,
        to: receiverAddress,
        value: ethers.utils.parseEther(amountToken),
        nonce: provider.getTransactionCount(
            senderAddress,
          "latest"
        ),
        gasLimit: ethers.utils.hexlify(gasLimit),
        gasPrice: gasPriceHex,
      }

      try {
        const transactionResult = await signer.sendTransaction(tx)
        if (transactionResult) {
            console.log("Send token successfully!!!")
            console.log(transactionResult)
        }
      } catch (error) {
            console.log("Send token failed!!!")
      }
}


const SENDER_ADDRESS = process.env.SENDER_ADDRESS
const SENDER_PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS
const AMOUNT_ETH_TOKEN = process.env.AMOUNT_ETH_TOKEN

sendTransaction(
	SENDER_ADDRESS,
	RECEIVER_ADDRESS,
	AMOUNT_ETH_TOKEN,
	SENDER_PRIVATE_KEY
)