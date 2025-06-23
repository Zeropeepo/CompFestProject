import React, { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import SubscriptionPage from './components/SubscriptionPage';
import ContactPage from './components/ContactPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';

type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export default function App() {
  const [activePage, setActivePage] = useState('Home');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('sea-catering-token');
    if (token) {
      setAuthToken(token);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        handleLogout();
        console.error('Session expired or token invalid. Logging out.');
        return; 
      }
      const userData: UserProfile = await response.json();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      handleLogout();
    }
  };

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token); 
    fetchUserProfile(token); 
    setActivePage('Home'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('sea-catering-token');
    localStorage.removeItem('sea-catering-csrf');
    setAuthToken(null);
    setCurrentUser(null);
    setActivePage('Home');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <HomePage currentUser={currentUser} setActivePage={setActivePage} />;
      case 'Menu':
        return <MenuPage />;
      case 'Subscription':
        return currentUser ? <SubscriptionPage currentUser={currentUser} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'Contact Us':
        return <ContactPage />;
      case 'Register':
        return <RegisterPage />;
      case 'Login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <HomePage currentUser={currentUser} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar
        isLoggedIn={!!currentUser} 
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
}