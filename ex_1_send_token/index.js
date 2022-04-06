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


const from = "0x9b500a4B354914d420c3D1497AEe4Ba9d45b7Df0"
const fromPrivateKey = "7cac11ffdd602686f28e1b9bf8fd45008fb682ad75f58166bfb0ff08bb879573"
const to = "0xDBA77eb478285ae2518056F785eF6190a2B3185C"
const amount = "0.1"
sendTransaction(from, to, amount, fromPrivateKey)