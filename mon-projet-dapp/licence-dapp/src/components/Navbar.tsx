import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
    return (
        <nav className="w-full bg-gray-800 shadow-lg py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-6">

                <div></div>
                <Link to="/" className="text-xl font-bold text-white hover:text-blue-400">
                    DApp Licenses
                </Link>
                <div className="flex space-x-4">
                    <Link to="/licenses" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md">
                        Licenses
                    </Link>
                    
                    <div><Link to="/my-licenses" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md">
                        Mes Licences
                    </Link></div>
                    <div><Link to="/user-licenses" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-md">
                        Licences Utilisateur
                    </Link></div>
                    
                    <Link to="/transfer" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md">
                        Transfert
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
