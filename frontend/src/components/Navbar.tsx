import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  isLoggedIn: boolean; 
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  userRole?: string; 
};

const Navbar = ({ isLoggedIn, activePage, setActivePage, onLogout, userRole }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = isLoggedIn
    ? ["Home", "Menu", "Subscription", "Dashboard", "Contact Us", ...(userRole === "admin" ? ["Admin"] : [])] // Links for logged-in users
    : ["Home", "Menu", "Contact Us"];  // Links for guests

    const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    setActivePage(page);
    setIsOpen(false);
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onLogout();
    setIsOpen(false);
  }

  return (
    <header className="absolute top-0 left-0 w-full z-10 px-4 sm:px-8 lg:px-16 py-5">
      <div className="container mx-auto flex justify-between items-center">
        {/* Business Name */}
        <a href="#" onClick={(e) => handleNavClick(e,'Home')} className="text-xl font-bold text-gray-800 hover:text-green-700 transition-colors">
          SEA Catering
        </a>

        {/* --- DESKTOP NAVIGATION --- */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a key={link} href="#" onClick={(e) => handleNavClick(e, link)} className={`text-sm font-medium transition-colors hover:text-green-600 ${activePage === link ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
              {link}
            </a>
          ))}
          {/* --- NEW: Conditional Login/Logout/Register Buttons --- */}
          {isLoggedIn ? (
            <button onClick={handleLogoutClick} className="bg-gray-800 text-white font-bold hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors">Logout</button>
          ) : (
            <div className="flex items-center space-x-4">
                <a href="#" onClick={(e) => handleNavClick(e, 'Login')} className="text-sm font-medium text-gray-600 hover:text-green-600">Login</a>
                <a href="#" onClick={(e) => handleNavClick(e, 'Register')} className="bg-green-600 text-white font-bold hover:bg-green-700 px-4 py-2 rounded-md text-sm transition-colors">Register</a>
            </div>
          )}
        </nav>

        {/* --- NEW: Mobile Menu Button (fully functional) --- */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* --- NEW: Mobile Menu Overlay (fully functional) --- */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-5">
          <button onClick={() => setIsOpen(false)}>
            <X size={24} className="text-gray-800" />
          </button>
        </div>
        <nav className="flex flex-col p-5 space-y-4">
          {navLinks.map((link) => (
            <a key={link} href="#" onClick={(e) => handleNavClick(e, link)} className={`text-lg font-medium text-center hover:text-green-600 ${activePage === link ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
              {link}
            </a>
          ))}
           {/* --- NEW: Conditional Login/Logout/Register Buttons for Mobile --- */}
          <div className="border-t pt-4 space-y-3">
             {isLoggedIn ? (
                <button onClick={handleLogoutClick} className="w-full bg-gray-800 text-white font-bold py-2 rounded-md text-sm">Logout</button>
             ) : (
                <>
                    <a href="#" onClick={(e) => handleNavClick(e, 'Login')} className="block text-center text-lg font-medium text-gray-700 hover:text-green-600">Login</a>
                    <a href="#" onClick={(e) => handleNavClick(e, 'Register')} className="block w-full text-center bg-green-600 text-white font-bold py-2 rounded-md text-sm">Register</a>
                </>
             )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;