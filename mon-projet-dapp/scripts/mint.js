const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const toAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; 
    const metadataURI = "https://exemple.com/metadata.json"; 

    const contract = await ethers.getContractAt("LicenceNFT", contractAddress);
    const tx = await contract.mintLicence(toAddress, metadataURI);
    await tx.wait();

    console.log(`Licence NFT mintée pour ${toAddress} avec URI: ${metadataURI}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
