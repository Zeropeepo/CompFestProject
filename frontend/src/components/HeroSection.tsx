
import { Link } from 'react-router-dom';


const HeroSection = () => { 
  return (
    <section className="h-screen bg-green-200/60 pt-25 pb-30">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
              Healthy Meals,
              <br />
              Anytime, Anywhere.
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
              Welcome to SEA Catering! We provide delicious, customizable, and healthy meals delivered straight to your door, anywhere across Indonesia.
            </p>
            <div className="mt-8">
  
              <Link 
                to="/menu"
                className="bg-gray-800 text-white font-bold hover:bg-gray-700 px-8 py-3 rounded-md text-base transition-colors"
              >
                Explore Meal Plans
              </Link>
            </div>
          </div>
          
          {/* Image Placeholder  */}
          <div className="hidden md:flex justify-center items-center">
            <img 
              src="/icons/food.png" 
              alt="A healthy meal in a bowl" 
              className="rounded-full shadow-lg w-4/5 object-cover -rotate-15"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;