import { useState, useEffect } from "react";
import { ethers, FunctionFragment } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [licenses, setLicenses] = useState<{ description: string; price: string }[]>([]);
    const [showLicenses, setShowLicenses] = useState<boolean>(false);

    useEffect(() => {
        checkWalletConnection();
    }, []);

    async function checkWalletConnection() {
        if (!window.ethereum) {
            console.warn("⚠️ Metamask non détecté !");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                console.log("🔗 Wallet déjà connecté :", accounts[0]);
                await setupContract();
            }
        } catch (error) {
            console.error("❌ Erreur lors de la vérification de Metamask :", error);
        }
    }

    async function connectWallet() {
        if (!window.ethereum) {
            alert("Veuillez installer Metamask !");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
            console.log("🔗 Wallet connecté :", accounts[0]);
            await setupContract();
        } catch (error) {
            console.error("❌ Erreur de connexion à Metamask :", error);
        }
    }

    async function setupContract() {
        try {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const web3Signer = await web3Provider.getSigner();

            const contractABI = [
                "function getAvailableLicenses() public view returns (string[], uint256[])",
                "function mintLicence(uint256 licenceIndex) public payable"
            ];
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, web3Signer);

            setContract(contractInstance);
            console.log("✅ Contrat chargé :", contractInstance);

            console.log(
                "🔹 Méthodes du contrat disponibles :",
                contractInstance.interface.fragments
                    .filter((f) => f.type === "function")
                    .map((f) => (f as FunctionFragment).name)
            );
        } catch (error) {
            console.error("❌ Erreur lors du chargement du contrat :", error);
        }
    }

    async function fetchLicenses() {
        if (!contract) {
            alert("Connecte-toi à Metamask d'abord !");
            return;
        }
        try {
            console.log("🔍 Vérification du réseau Metamask...");

            const network = await window.ethereum.request({ method: "net_version" });
            console.log("🌍 Réseau Metamask :", network);

            if (network !== "31337") {
                alert("🚨 Metamask n'est pas sur Hardhat (localhost). Change le réseau !");
                return;
            }

            console.log("✅ Metamask est sur Hardhat !");

            console.log("🔍 Récupération des licences...");
            const [descriptions, prices] = await contract.getAvailableLicenses();
            console.log("🔹 Résultat brut :", descriptions, prices);

            const formattedLicenses = descriptions.map((desc: string, index: number) => ({
                description: desc,
                price: ethers.formatEther(prices[index]) + " ETH",
            }));

            console.log("📜 Licences disponibles :", formattedLicenses);
            setLicenses(formattedLicenses);
            setShowLicenses(true);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des licences :", error);
        }
    }

    async function mintNFT(licenceIndex: number) {
        if (!contract || !walletAddress) {
            alert("⚠️ Connecte-toi à Metamask d'abord !");
            return;
        }
        try {
            console.log(`⏳ Minting du NFT Licence ${licenceIndex} pour ${walletAddress}...`);

         
            const [_, prices] = await contract.getAvailableLicenses();
            console.log("🔹 Prix récupérés :", prices);

            if (!prices || prices.length === 0) {
                console.error("❌ Erreur : Aucun prix de licence trouvé.");
                alert("❌ Aucun prix de licence disponible.");
                return;
            }

            if (licenceIndex < 0 || licenceIndex >= prices.length) {
                console.error("❌ Erreur : Index de licence invalide.");
                alert("❌ Licence sélectionnée invalide.");
                return;
            }

            const price = prices[licenceIndex];

            if (price === undefined || price === null) {
                console.error("❌ Erreur : Prix introuvable pour l'index", licenceIndex);
                alert("❌ Prix introuvable pour la licence sélectionnée.");
                return;
            }

            const priceInWei = ethers.toBigInt(price);
            console.log(`💰 Prix en Wei: ${priceInWei.toString()} Wei`);

      
            const tx = await contract.mintLicence(licenceIndex, { value: priceInWei });

            console.log("⏳ Transaction envoyée, en attente de confirmation...");
            await tx.wait();

            console.log(`✅ NFT minté avec succès ! Token ID : ${licenceIndex}`);
            alert(`✅ NFT minté avec succès !`);
        } catch (error: any) {
            console.error("❌ Erreur lors du minting :", error);

            if (error.reason) {
                alert(`❌ Erreur : ${error.reason}`);
            } else {
                alert(`❌ Une erreur est survenue.`);
            }
        }
    }


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">DApp Metamask & NFT</h1>

            {walletAddress ? (
                <>
                    <p className="mb-4">Adresse: {walletAddress}</p>

                    <button
                        onClick={fetchLicenses}
                        className="bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600 transition mt-4"
                    >
                        Afficher les Licences
                    </button>

                    {showLicenses && (
                        <div>
                            <h2 className="text-2xl font-semibold mt-6">Licences Disponibles</h2>
                            <ul className="mt-4">
                                {licenses.map((licence, index) => (
                                    <li key={index} className="border p-2 m-2 rounded-lg bg-gray-800">
                                        <p className="font-bold">{licence.description}</p>
                                        <p>Prix: {licence.price}</p>
                                        <button
                                            onClick={() => mintNFT(index)}
                                            className="mt-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Minter
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                <button
                    onClick={connectWallet}
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                    Se connecter à Metamask
                </button>
            )}
        </div>
    );
}

export default App;
