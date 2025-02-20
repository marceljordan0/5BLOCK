

import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Licenses from "./pages/Licenses";
import MyLicenses from "./pages/MyLicenses";
import LicenseDetails from "./pages/LicenseDetails";
import TransferLicense from "./pages/TransferLicense";
import UserLicenses from "./pages/UserLicenses";

function App() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateCursor = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        };

        document.addEventListener("mousemove", updateCursor);
        return () => document.removeEventListener("mousemove", updateCursor);
    }, []);

    return (
        <Router>
          
            <div ref={cursorRef} className="cursor-glow"></div>

           
            <div className="min-h-screen bg-dark-gradient text-white flex flex-col items-center">
            
                <nav className="fixed top-0 left-0 right-0 flex justify-center gap-6 p-4 bg-black bg-opacity-50 backdrop-blur-md shadow-lg">
                    <Link to="/" className="nav-link">Accueil</Link>
                    <Link to="/licenses" className="nav-link">Licenses</Link>
                    <Link to="/my-licenses" className="nav-link">Mes Licences</Link>
                    <Link to="/user-licenses" className="nav-link">Licences Utilisateur</Link>
                    <Link to="/transfer" className="nav-link">Transfert</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/licenses" element={<Licenses />} />
                    <Route path="/my-licenses" element={<MyLicenses />} />
                    <Route path="/license/:id" element={<LicenseDetails />} />
                    <Route path="/transfer" element={<TransferLicense />} />
                    <Route path="/user-licenses" element={<UserLicenses />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
