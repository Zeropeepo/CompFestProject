import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';

// --- NEW: Define props to accept login status from App.tsx ---
type HomePageProps = {
  isLoggedIn: boolean;
  setActivePage: (page: string) => void;
};

const HomePage = ({ isLoggedIn, setActivePage }: HomePageProps) => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      {/* --- NEW: Pass the props down to the TestimonialsSection --- */}
      <TestimonialsSection isLoggedIn={isLoggedIn} setActivePage={setActivePage} />
    </>
  );
};

export default HomePage;