
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";

const CONTRACT_ADDRESS = "0x280f73F528Cc1D925D48A1f3Ef014481eddF26dD";

function LicenseDetails() {
    const { id } = useParams();
    const [license, setLicense] = useState<{
        owner: string;
        issuedAt: string;
        description: string;
        price: string;
    } | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || isNaN(Number(id))) {
            setError("❌ ID invalide.");
            return;
        }
        fetchLicenseDetails(Number(id));
    }, [id]);

    async function fetchLicenseDetails(tokenId: number) {
        if (!window.ethereum) {
            setError("❌ Metamask non disponible !");
            return;
        }
        try {
            const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
            const signer = await provider.getSigner();
            const contractABI = [
                "function ownerOf(uint256 tokenId) public view returns (address)",
                "function getLicenseDetails(uint256 tokenId) public view returns (address, uint256, string, uint256)"
            ];
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            // 🔹 Vérifier si la licence existe
            let owner;
            try {
                owner = await contract.ownerOf(tokenId);
            } catch {
                setError("❌ Cette licence n'existe pas ou n'a pas été mintée.");
                return;
            }

            // 🔹 Récupérer les détails de la licence
            const [_, issuedAt, description, price] = await contract.getLicenseDetails(tokenId);

            setLicense({
                owner,
                issuedAt: new Date(Number(issuedAt) * 1000).toLocaleString(),
                description,
                price: ethers.formatEther(price) + " ETH",
            });

            
            const block = await provider.getBlock("latest");
            if (block && block.transactions.length > 0) {
                setTransactionHash(block.transactions[block.transactions.length - 1]);
            }
        } catch (error) {
            console.error("❌ Erreur lors du chargement des détails de la licence :", error);
            setError("❌ Impossible de charger les détails.");
        }
    }

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold my-6">Détails de la Licence #{id}</h1>

            {error ? (
                <p className="text-red-500">{error}</p>
            ) : license ? (
                <div className="border p-6 rounded-lg bg-gray-800">
                    <p className="font-bold text-blue-400">Propriétaire : {license.owner}</p>
                    <p>Description : {license.description}</p>
                    <p>Prix payé : {license.price}</p>
                    <p>Date d'achat : {license.issuedAt}</p>
                    {transactionHash && (
                        <p className="text-green-400">Hash de la transaction : {transactionHash}</p>
                    )}
                </div>
            ) : (
                <p className="text-gray-400">🔍 Chargement des détails...</p>
            )}
        </div>
    );
}

export default LicenseDetails;
