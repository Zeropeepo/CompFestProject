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
  setActivePage: (page: string) => void;
};

const HomePage = ({ currentUser, setActivePage }: HomePageProps) => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />

      <TestimonialsSection currentUser={currentUser} setActivePage={setActivePage} />
    </>
  );
};

export default HomePage;