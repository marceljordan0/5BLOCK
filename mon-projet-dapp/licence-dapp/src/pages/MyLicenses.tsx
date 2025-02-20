
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = "0x280f73F528Cc1D925D48A1f3Ef014481eddF26dD";

function MyLicenses() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [userLicenses, setUserLicenses] = useState<{ id: number; description: string; ipfsHash: string }[]>([]);
    const [searchHash, setSearchHash] = useState("");
    const [transactionDetails, setTransactionDetails] = useState<any | null>(null);
    const navigate = useNavigate();

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
                fetchUserLicenses(accounts[0]);
            }
        } catch (error) {
            console.error("❌ Erreur lors de la connexion à Metamask :", error);
        }
    }

    async function fetchUserLicenses(userAddress: string) {
        if (!window.ethereum) {
            console.error("❌ Metamask n'est pas disponible !");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            const contractABI = [
                "function getUserLicences(address user) public view returns (uint256[])",
                "function getLicenseDetails(uint256 tokenId) public view returns (address, uint256, string, uint256)",
                "function getAvailableLicenses() public view returns (string[], uint256[], string[])"
            ];
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            const licenses = await contract.getUserLicences(userAddress);
            console.log("Licenses owned:", licenses);

            const licensesWithDetails = await Promise.all(
                licenses.map(async (id: number) => {
                    const [, , description, ipfsHash] = await contract.getLicenseDetails(id);
                    return { id: Number(id), description, ipfsHash };
                })
            );

            console.log("Licenses details:", licensesWithDetails);
            setUserLicenses(licensesWithDetails);
        } catch (error) {
            console.error("❌ Erreur lors du chargement des licences :", error);
        }
    }

    async function fetchTransactionDetails(hash: string) {
        if (!window.ethereum) {
            console.error("❌ Metamask n'est pas disponible !");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const transaction = await provider.getTransactionReceipt(hash);

            if (!transaction) {
                setTransactionDetails(null);
                alert("❌ Transaction introuvable. Vérifiez le hash.");
                return;
            }

            setTransactionDetails(transaction);
        } catch (error) {
            console.error("❌ Erreur lors de la récupération des détails de la transaction :", error);
        }
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold my-6">Mes Licences</h1>

            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="Hash de la transaction"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={() => fetchTransactionDetails(searchHash)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Voir détails de la transaction
                </button>
            </div>

            {transactionDetails && (
                <div className="border p-4 mt-4 rounded bg-gray-800">
                    <h2 className="text-lg font-bold">Détails de la Transaction</h2>
                    <p>Hash : {transactionDetails.transactionHash}</p>
                    <p>De : {transactionDetails.from}</p>
                    <p>À : {transactionDetails.to}</p>
                    <p>Gas utilisé : {transactionDetails.gasUsed.toString()}</p>
                    <p>Block : {transactionDetails.blockNumber}</p>
                </div>
            )}

            {!walletAddress ? (
                <p className="text-yellow-500">🔗 Connectez-vous à Metamask pour voir vos licences.</p>
            ) : userLicenses.length === 0 ? (
                <p className="text-gray-400">Vous ne possédez aucune licence.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userLicenses.map(({ id, description }) => (
                        <div
                            key={id}
                            className="border p-4 rounded bg-gray-800 cursor-pointer hover:bg-gray-700"
                            onClick={() => navigate(`/license/${id}`)}
                        >
                            <img
                                src={`https://bafybeihimy4ml4n2vkyutakero5k6uu53w7lbfwjojc2ac3mmp2tg4pjhy.ipfs.dweb.link?filename=Animal.jpg`}
                                alt={`Licence #${id}`}
                                className="w-full h-40 object-cover rounded"
                            />
                            <p className="mt-2 text-white font-bold">📜 Licence #{id}</p>
                            <p className="text-gray-400">{description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyLicenses;
