import { Link } from "react-router-dom";

const Home: React.FC = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-white text-center overflow-hidden">
         
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient blur-2xl opacity-50"></div>
            
           
            <div className="relative z-10 px-6">
                <h1 className="text-5xl font-extrabold mb-4 animate-fade-in">
                    Bienvenue sur la DApp Licenses
                </h1>
                <p className="text-lg text-gray-200 mb-6 animate-fade-in delay-200">
                    Achetez et gérez vos licences NFT de manière sécurisée et décentralisée.
                </p>
                
                <Link to="/licenses" className="px-8 py-3 text-lg font-bold bg-blue-600 hover:bg-blue-400 rounded-lg shadow-lg transition duration-300 transform hover:scale-105">
                    Découvrir les Licences
                </Link>
            </div>
        </div>
    );
};

export default Home;
