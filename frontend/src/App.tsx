import Navbar from './components/Navbar'
import Footer from './components/Footer';
import SubscriptionPage from './components/SubscriptionPage';
import ContactPage from './components/ContactPage';
import MenuPage from './components/MenuPage';
import React, { useEffect } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

export default function App() {
    const [activePage, setActivePage] = React.useState('Home');
    
    // Authentication Token
    const [authToken, setAuthToken] = React.useState<string | null>(null);

    useEffect(() => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('sea-catering-token');
      if (token) {
        setAuthToken(token);
      }
    }, []);

      // Login
    const handleLoginSuccess = (token: string) => {
      setAuthToken(token);
      setActivePage('Home'); 
    };

    // Logout
    const handleLogout = () => {
      localStorage.removeItem('sea-catering-token'); 
      setAuthToken(null); 
      setActivePage('Home'); 
    };

    const renderPage = () => {
    switch (activePage) {
      case 'Home':
         return <HomePage isLoggedIn={authToken !== null} setActivePage={setActivePage} />;
      case 'Menu':
        return <MenuPage />;
      // --- PROTECTED ROUTE ---
      case 'Subscription':
        // If there's an auth token, show the subscription page. Otherwise, show the login page.
        return authToken ? <SubscriptionPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'Contact Us':
        return <ContactPage />;
      case 'Register':
        return <RegisterPage />;
      case 'Login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <HomePage isLoggedIn={authToken !== null} setActivePage={setActivePage} />;
    }
  };

    return (
    <div className="bg-white min-h-screen">
      {/* We now pass login status and handlers to the Navbar */}
      <Navbar
        isLoggedIn={authToken !== null}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />
      
      <main>{renderPage()}</main>
      
      <Footer />
    </div>
  );
}
