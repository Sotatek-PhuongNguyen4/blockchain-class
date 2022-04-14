# TOKEN SMART CONTRACT

### Link contract 
https://rinkeby.etherscan.io/address/0xBB1087A23cFDA180a3428181252AF333aA530B35

### Install dependency
```
npm install
```
### Edit env
```
cp .env.example .env
```
-INFURA_API_KEY: Infura key
-RINKEBY_PRIVATE_KEY: private key of account that owner of contract
-ETHER_SCAN_API_KEY: etherscan api key to verify contract

### Deploy contract
```
npx hardhat run .\scripts\deploy.js --network rinkeby
```
### Verify contract
```
npx hardhat verify --network rinkeby CONTRACT_ADDRESS_DEPLOYED "TESTTOKEN" "TTT" 18 1000000000000000000000 "0xD2C8DE021766f0409f880Fc1B3Bc0aA4A2c5FEA1"
```
### Test function
```
node .\scripts\call.js
```


