import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import SubscriptionPage from './components/SubscriptionPage';
import ContactPage from './components/ContactPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import UserDashboardPage from './components/UserDashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';

// UserProfile type remains the same
type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export default function App() {
  // const [activePage, setActivePage] = useState('Home');

  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('sea-catering-token'));
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
      const response = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        handleLogout();
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
  };
  
  const handleLogout = () => {
    localStorage.removeItem('sea-catering-token');
    localStorage.removeItem('sea-catering-csrf');
    setAuthToken(null);
    setCurrentUser(null);
  };
  


  return (
    <BrowserRouter>
      <div className="bg-white min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={!!currentUser} 
          onLogout={handleLogout}
          userRole={currentUser?.role}
        />
        {/*  Use <Routes> for declarative routing */}
        <main className="flex-grow">
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<HomePage currentUser={currentUser} />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/contact-us" element={<ContactPage />} />


            {/* Auth Routes: Redirect if already logged in */}
            <Route path="/login" element={!currentUser ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/dashboard" />} />


            {/* Protected Routes: Redirect to login if not logged in */}
            <Route path="/subscription" element={currentUser ? <SubscriptionPage currentUser={currentUser} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={currentUser ? <UserDashboardPage /> : <Navigate to="/login" />} />
            

            {/* Admin-only Route */}
            <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/" />} />


            {/* Fallback Route for unknown paths */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}