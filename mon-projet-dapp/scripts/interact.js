const hre = require("hardhat");

async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 
    const LicenceNFT = await hre.ethers.getContractFactory("LicenceNFT");
    const licenceNFT = await LicenceNFT.attach(contractAddress);

    
    const [owner] = await hre.ethers.getSigners();

    console.log("👤 Propriétaire du contrat :", await licenceNFT.owner());

    let ownedBefore = await licenceNFT.getOwnedLicenses(owner.address);
    console.log(`📜 Licences possédées avant mint : ${ownedBefore}`);

  
    console.log("⏳ Minting en cours...");
    const tokenURI = "https://ipfs.io/ipfs/Qm..."; 
    const tx = await licenceNFT.mintLicence(owner.address, tokenURI);
    await tx.wait();

    console.log(`✅ NFT minté avec succès pour : ${owner.address}`);

 
    let ownedAfter = await licenceNFT.getOwnedLicenses(owner.address);
    console.log(`📜 Licences possédées après mint : ${ownedAfter}`);

 
    const lastTokenId = await licenceNFT.getLastTokenId();
    console.log(`🔢 Dernier Token ID minté : ${lastTokenId}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
