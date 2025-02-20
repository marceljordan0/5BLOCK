const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LicenceNFT", function () {
    let LicenceNFT, licenceNFT, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        LicenceNFT = await ethers.getContractFactory("LicenceNFT");
        licenceNFT = await LicenceNFT.deploy();
        await licenceNFT.waitForDeployment();
    });

    it("Devrait permettre au propriétaire de déployer le contrat", async function () {
        expect(await licenceNFT.owner()).to.equal(owner.address);
    });

    it("Devrait récupérer les licences disponibles", async function () {
        const licenses = await licenceNFT.getAvailableLicenses();
        expect(licenses[0].length).to.be.greaterThan(0);
    });

    it("Devrait permettre d'acheter une licence", async function () {
        const licenceIndex = 0;
        const price = (await licenceNFT.availableLicences(licenceIndex)).price;

        await expect(
            licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price })
        ).to.emit(licenceNFT, "LicenceMinted");
    });

    it("Devrait échouer si le paiement est incorrect", async function () {
        const licenceIndex = 0;
        await expect(
            licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: ethers.parseEther("0.01") })
        ).to.be.revertedWith("Montant incorrect");
    });

it("Devrait appliquer la limite de 4 licences par utilisateur", async function () {
    const licenceIndex = 0;
    const price = (await licenceNFT.availableLicences(licenceIndex)).price;

    for (let i = 0; i < 4; i++) {
        await licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes pour respecter le cooldown
    }

    await expect(
        licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price })
    ).to.be.revertedWith("Limite atteinte");
});

    it("Devrait respecter le cooldown entre achats", async function () {
        const licenceIndex = 0;
        const price = (await licenceNFT.availableLicences(licenceIndex)).price;

        await licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price });

        await expect(
            licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price })
        ).to.be.revertedWith("Attendez avant de racheter");

        // Attendre le cooldown
        await new Promise(resolve => setTimeout(resolve, 3000));

        await licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price });
    });

    it("Devrait permettre le transfert de licence", async function () {
        const licenceIndex = 0;
        const price = (await licenceNFT.availableLicences(licenceIndex)).price;

        await licenceNFT.connect(addr1).mintLicence(licenceIndex, { value: price });

        const tokenId = (await licenceNFT.getUserLicences(addr1.address))[0];

        await licenceNFT.connect(addr1).transferLicence(addr2.address, tokenId);

        expect(await licenceNFT.ownerOf(tokenId)).to.equal(addr2.address);
    });
});
