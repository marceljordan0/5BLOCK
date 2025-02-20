const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const addressToCheck = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 

    const contract = await ethers.getContractAt("LicenceNFT", contractAddress);
    const licences = await contract.getOwnedLicenses(addressToCheck);

    console.log(`Licences possédées par ${addressToCheck} :`, licences.toString());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
