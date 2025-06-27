// in HomePage.tsx

import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';


type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};


type HomePageProps = {
  currentUser: UserProfile | null; 
};


const HomePage = ({ currentUser }: HomePageProps) => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection currentUser={currentUser} />
    </>
  );
};

export default HomePage;