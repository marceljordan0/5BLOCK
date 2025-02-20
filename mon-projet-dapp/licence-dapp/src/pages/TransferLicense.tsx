import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x280f73F528Cc1D925D48A1f3Ef014481eddF26dD"; 
const ABI: ethers.Interface | ethers.InterfaceAbi = [

];

const TransferLicense: React.FC = () => {
    const [tokenId, setTokenId] = useState<string>("");
    const [recipient, setRecipient] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    const handleTransfer = async () => {
        if (!window.ethereum) {
            setStatus("Veuillez installer MetaMask.");
            return;
        }

        try {
            setStatus("Connexion au portefeuille...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            setStatus("Transfert en cours...");
            const transaction = await contract.safeTransferFrom(
                await signer.getAddress(),
                recipient,
                tokenId
            );
            await transaction.wait();

            setStatus(`✅ Transfert réussi ! Tx Hash: ${transaction.hash}`);
        } catch (error) {
            console.error(error);
            setStatus("❌ Erreur lors du transfert.");
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <h1 className="text-2xl font-bold mb-4">Transfert de Licence</h1>

            <input
                type="text"
                placeholder="ID de la Licence"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="p-2 mb-2 border rounded text-black"
            />
            <input
                type="text"
                placeholder="Adresse du destinataire"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="p-2 mb-2 border rounded text-black"
            />
            <button
                onClick={handleTransfer}
                className="bg-yellow-400 text-black px-4 py-2 rounded mt-2 hover:bg-yellow-300"
            >
                Transférer
            </button>

            {status && <p className="mt-4">{status}</p>}
        </div>
    );
};

export default TransferLicense;
