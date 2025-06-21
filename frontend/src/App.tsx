import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar'
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import SubscriptionPage from './components/SubscriptionPage';
import ContactPage from './components/ContactPage';
import MenuPage from './components/MenuPage';
import React from 'react';
import TestimonialsSection from './components/TestimonialsSection';

export default function App() {
    const [activePage, setActivePage] = React.useState('Home');
    
    const Homepage = () => (
      <>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </>
    );

    const renderPage = () => {
      switch (activePage) {
        case 'Home':
          return <Homepage />

        case 'Subscription':
          return <SubscriptionPage />

        case 'Contact Us':
          return <ContactPage />

        case 'Menu':
          return <MenuPage />
      }
    }

    return(
      <div className="bg-white min-h-screen">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main>
          {renderPage()}
        </main>

        <Footer />
      </div>
    )
}
