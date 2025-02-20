
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x280f73F528Cc1D925D48A1f3Ef014481eddF26dD";

function Licenses() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [licenses, setLicenses] = useState<{
        id: number;
        imageUrl: string | undefined;
        description: string;
        price: string;
        priceInWei: bigint;
    }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [buying, setBuying] = useState<number | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    const checkWalletConnection = useCallback(async () => {
        if (!window.ethereum) {
            console.warn("⚠️ Metamask non détecté !");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                fetchLicenses();
            }
        } catch (error) {
            console.error("❌ Erreur lors de la connexion à Metamask :", error);
        }
    }, []);

    useEffect(() => {
        checkWalletConnection();
    }, [checkWalletConnection]);

    async function connectWallet() {
        if (!window.ethereum) {
            alert("⚠️ Metamask non détecté. Veuillez l'installer !");
            return;
        }
        try {
            setLoading(true);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletAddress(accounts[0]);
            fetchLicenses();
        } catch (error) {
            console.error("❌ Erreur de connexion à Metamask :", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchLicenses() {
        if (!window.ethereum) {
            console.error("❌ Metamask non disponible !");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const signer = await provider.getSigner();

            const contractABI = [
                "function getAvailableLicenses() public view returns (uint256[], string[], uint256[], string[])",
                "function mintLicence(uint256 licenceIndex) public payable",
            ];

            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            console.log("✅ Récupération des licences...");

            const [ids, descriptions, prices] = await contract.getAvailableLicenses();

            const formattedLicenses = descriptions.map((desc: string, index: number) => ({
                id: Number(ids[index]),
                description: desc,
                price: ethers.formatEther(prices[index]) + " ETH",
                priceInWei: prices[index],


                imageUrl: `https://bafybeihimy4ml4n2vkyutakero5k6uu53w7lbfwjojc2ac3mmp2tg4pjhy.ipfs.dweb.link?filename=Animal.jpg`,

                // lien local http://bafybeica4vlwo6hdj2mfwdf4u4xnrf2sgn4ol7362sdwloiurhho5axq54.ipfs.localhost:8080/Animal.jpg
                
            }));

            setLicenses(formattedLicenses);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des licences :", error);
        }
    }

    async function mintNFT(licenceIndex: number) {
        if (!window.ethereum || !walletAddress) {
            alert("⚠️ Connecte-toi à Metamask !");
            return;
        }
        try {
            setBuying(licenceIndex);

            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            const contractABI = ["function mintLicence(uint256 licenceIndex) public payable"];
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            const priceInWei = licenses[licenceIndex].priceInWei;
            console.log(`💰 Achat de la licence #${licenceIndex} pour ${ethers.formatEther(priceInWei)} ETH`);

            const tx = await contract.mintLicence(licenceIndex, { value: priceInWei });
            setTransactionHash(tx.hash);

            console.log("⏳ Transaction envoyée, en attente de confirmation...");
            await tx.wait();

            alert(`✅ Licence #${licenceIndex} achetée avec succès ! Transaction Hash : ${tx.hash}`);
        } 
        
        catch (error) {
            console.error("❌ Erreur lors de l'achat :", error);
            alert("❌ Échec de l'achat.");
        } 
        finally {
            setBuying(null);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold my-6">Liste des Licences Disponibles pour Achat</h1>

            {!window.ethereum ? (
                <p className="text-red-500">
                    🚨 Metamask non détecté. Installez-le pour utiliser cette application.
                </p>
            ) : !walletAddress ? (
                <button
                    onClick={connectWallet}
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    disabled={loading}
                >
                    {loading ? "Connexion..." : "Se connecter à Metamask"}
                </button>
            ) : (
                <>
                    <p className="mb-4">🔗 Addresse Connectée : {walletAddress}</p>

                    {transactionHash && (
                        <p className="text-blue-400">
                            🛠️ ID de transaction : <span className="font-mono">{transactionHash}</span>
                        </p>
                    )}

                    {licenses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {licenses.map((license, index) => (
                                <div key={index} className="border p-4 rounded-lg bg-gray-800">
                                    <img
                                        src={license.imageUrl}
                                        alt={`Licence ${index}`}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <p className="font-bold">ID: {license.id} - {license.description}</p>
                                    <p>Prix: {license.price}</p>
                                    <button
                                        onClick={() => mintNFT(index)}
                                        className="mt-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                        disabled={buying === index}
                                    >
                                        {buying === index ? "Achat en cours..." : "Acheter"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-400">🔍 Aucune licence disponible.</p>
                    )}
                </>
            )}
        </div>
    );
}

export default Licenses;
