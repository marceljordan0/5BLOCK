import React, { useState, useEffect } from "react";

const History: React.FC = () => {
    const [purchases, setPurchases] = useState<{ description: string; price: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setPurchases([
                { description: "Licence Standard", price: "0.05 ETH" },
                { description: "Licence Premium", price: "0.1 ETH" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl font-bold my-6">Historique des Achats</h1>

            {loading ? (
                <p className="text-yellow-400">⏳ Chargement...</p>
            ) : purchases.length > 0 ? (
                <ul className="mt-4">
                    {purchases.map((purchase, index) => (
                        <li key={index} className="border p-2 m-2 rounded-lg bg-gray-800">
                            <p className="font-bold">{purchase.description}</p>
                            <p>Prix: {purchase.price}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Aucun achat pour le moment.</p>
            )}
        </div>
    );
};

export default History; 
