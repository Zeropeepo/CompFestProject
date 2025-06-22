import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';


type HomePageProps = {
  isLoggedIn: boolean;
  setActivePage: (page: string) => void;
};

const HomePage = ({ isLoggedIn, setActivePage }: HomePageProps) => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection isLoggedIn={isLoggedIn} setActivePage={setActivePage} />
    </>
  );
};

export default HomePage;