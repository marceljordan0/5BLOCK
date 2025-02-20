
# License DApp Startup Configuration


## Dependencies for the project

In case of issue while launching the app, please install the following packages : 

`npm install --save-dev @nomicfoundation/hardhat-toolbox`

`npm install --save-dev ethereum-waffle chai ethers`

`npm install @openzeppelin/contracts`

`npm install ethers react-router-dom`

`npm install framer-motion`

`npm install -D tailwindcss postcss autoprefixer`



## 1. Commande pour déployer un contrat : 

Go inside the folder "...\mon-projet-dapp" :

`npx hardhat run .\scripts\deploy.js --network localhost`

/!\ Ganache in terminal / Desktop App should be launched before this command

## 2. Lancer le front : 
Go inside the folder "...\mon-projet-dapp\licence-dapp"

`npm run dev`



## 3. Pour acheter plusieurs licences il faut simplement recompiler le contrat (Etape 1)


## 4. Lancer le test local : 
Go inside the folder
 "...\5bloc\mon-projet-dapp" 

`npx hardhat test`

/!\ Set the following values to the 2 variables located in the ..."\mon-projet-dapp\contracts\LicenceNFT.sol" file

`COOLDOWN_PERIOD = 2 seconds`

`LOCK_PERIOD = 2 seconds`

