import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x280f73F528Cc1D925D48A1f3Ef014481eddF26dD";


const ABI = [
    "function getUserLicences(address user) public view returns (uint256[])",
    "function getLicenseDetails(uint256 tokenId) public view returns (address, uint256, string, uint256)"
];

const UserLicenses = () => {
    const [userAddress, setUserAddress] = useState("");
    const [licenses, setLicenses] = useState<{ id: number; description: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUserLicenses = async () => {
        if (!window.ethereum) {
            alert("Veuillez installer MetaMask.");
            return;
        }

        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

            const licenseIds = await contract.getUserLicences(userAddress);
            const licenseDetails = await Promise.all(
                licenseIds.map(async (id: number) => {
                    const [, , description] = await contract.getLicenseDetails(id);
                    return { id: Number(id), description };
                })
            );

            setLicenses(licenseDetails);
        } catch (error) {
            console.error("Erreur lors de la récupération des licences :", error);
            alert("Une erreur s'est produite.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <h1 className="text-2xl font-bold mb-4">Rechercher les Licences d'un Utilisateur</h1>
            <input
                type="text"
                placeholder="Adresse Ethereum de l'utilisateur"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                className="p-2 mb-2 border rounded text-black w-96"
            />
            <button
                onClick={fetchUserLicenses}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Rechercher
            </button>

            {loading && <p className="mt-4 text-yellow-400">Chargement...</p>}

            {licenses.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold">Licences de {userAddress}</h2>
                    <ul className="mt-2">
                        {licenses.map(({ id, description }) => (
                            <li key={id} className="border p-2 rounded mb-2 bg-gray-800">
                                <p className="text-white font-bold">📜 Licence #{id}</p>
                                <p className="text-gray-400">{description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserLicenses;
