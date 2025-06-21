import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar'
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';

function App() {

  return (
    <>
      <div className="bg-amber-50">
        <Navbar />
        {/* Main content of the app */}
        <main>
          <HeroSection />
          <FeaturesSection />
          <Footer />
        </main>
      </div>
    </>
    
  );
}

export default App
