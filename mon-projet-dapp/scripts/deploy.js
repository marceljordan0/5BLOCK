const hre = require("hardhat");

async function main() {

    const LicenceNFT = await hre.ethers.getContractFactory("LicenceNFT");

    const licenceNFT = await LicenceNFT.deploy();


    await licenceNFT.waitForDeployment();
    
    console.log("LicenceNFT contract deployed to:", await licenceNFT.getAddress()); 
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
