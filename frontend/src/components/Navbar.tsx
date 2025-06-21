import React from 'react';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const Navbar = ({activePage, setActivePage}: NavbarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = ["Home", "Menu", "Subscription", "Contact Us"];

  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    setActivePage(page);
    setIsOpen(false); // Close the mobile menu after clicking a link
  };

  return (
    <header className="absolute top-0 left-0 w-full z-10 px-4 sm:px-8 lg:px-16 py-5">
      <div className="container mx-auto flex justify-between items-center">
        {/* Business Name */}
        <a href="#" onClick={(e) => handleNavClick(e,'Home')} className="text-xl font-bold text-gray-800 hover:text-green-700 transition-colors">
          SEA Catering
        </a>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => handleNavClick(e, link)}
              className={`text-sm font-medium transition-colors hover:text-green-600 ${
                activePage === link ? 'text-green-600 font-semibold' : 'text-gray-600'
              }`}
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {/* If it's opened show X, else not */}
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity md:hidden ${
          isOpen ? "opacity-75" : "opacity-0 pointer-events-none"
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
            <a
              key={link}
              href="#"
              onClick={(e) => handleNavClick(e, link)}
              className={`text-lg font-medium text-center hover:text-green-600 ${
                activePage === link ? 'text-green-600 font-semibold' : 'text-gray-700'
              }`}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
