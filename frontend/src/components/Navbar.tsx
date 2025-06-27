import React, { useState } from 'react';
//  Import NavLink for routing and automatic active styles
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  isLoggedIn: boolean; 
  onLogout: () => void;
  userRole?: string; 
};

//  Navbar no longer needs activePage or setActivePage
const Navbar = ({ isLoggedIn, onLogout, userRole }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Define links with their paths
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Subscription", path: "/subscription", loggedIn: true },
    { name: "Dashboard", path: "/dashboard", loggedIn: true },
    { name: "Contact Us", path: "/contact-us" },
    { name: "Admin", path: "/admin", admin: true },
  ];

  // Filter links based on login and role status
  const visibleLinks = navLinks.filter(link => {
    if (link.admin) return isLoggedIn && userRole === 'admin';
    if (link.loggedIn) return isLoggedIn;
    return !link.loggedIn; // Show if it's not a "loggedIn only" link
  });

  const handleLogoutClick = () => {
    onLogout();
    setIsOpen(false);
    navigate('/'); // Redirect to home after logout
  }

  // Style for active NavLink
  const activeLinkStyle = {
    color: '#16a34a', // green-600
    fontWeight: '600',
  };

  return (
    <header className="sticky top-0 left-0 w-full bg-white/80 backdrop-blur-sm z-10 px-4 sm:px-8 lg:px-16 py-3 shadow-sm">
      <div className="container mx-auto flex justify-between items-center h-12">
        <NavLink to="/" className="text-xl font-bold text-gray-800 hover:text-green-700 transition-colors">
          NevaSEA Catering
        </NavLink>

        {/* --- DESKTOP NAVIGATION  --- */}
        <nav className="hidden md:flex items-center space-x-8">
          {visibleLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              // This function sets the style based on whether the link is active
              style={({ isActive }) => isActive ? activeLinkStyle : {}}
              className="text-sm font-medium transition-colors hover:text-green-600 text-gray-600"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          {isLoggedIn ? (
            <button onClick={handleLogoutClick} className="bg-gray-800 text-white font-bold hover:bg-gray-700 px-4 py-2 rounded-md text-sm transition-colors">Logout</button>
          ) : (
            <div className="flex items-center space-x-2">
                <NavLink to="/login" className="text-sm font-medium text-gray-600 hover:text-green-600 px-4 py-2 rounded-md">Login</NavLink>
                <NavLink to="/register" className="bg-green-600 text-white font-bold hover:bg-green-700 px-4 py-2 rounded-md text-sm transition-colors">Register</NavLink>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button (No change needed) */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU (MODIFIED) --- */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${isOpen ? "block" : "hidden"}`} onClick={() => setIsOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-end p-5"><button onClick={() => setIsOpen(false)}><X size={24} /></button></div>
        <nav className="flex flex-col p-5 space-y-4">
          {visibleLinks.map((link) => (
            <NavLink key={link.name} to={link.path} style={({ isActive }) => isActive ? activeLinkStyle : {}} className="text-lg font-medium text-center hover:text-green-600 text-gray-700" onClick={() => setIsOpen(false)}>
              {link.name}
            </NavLink>
          ))}
          <div className="border-t pt-4 space-y-3">
             {isLoggedIn ? (
                <button onClick={handleLogoutClick} className="w-full bg-gray-800 text-white font-bold py-2 rounded-md text-sm">Logout</button>
             ) : (
                <>
                    <NavLink to="/login" className="block text-center text-lg font-medium text-gray-700 hover:text-green-600" onClick={() => setIsOpen(false)}>Login</NavLink>
                    <NavLink to="/register" className="block w-full text-center bg-green-600 text-white font-bold py-2 rounded-md text-sm" onClick={() => setIsOpen(false)}>Register</NavLink>
                </>
             )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;