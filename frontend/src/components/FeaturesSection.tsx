import { Leaf, Truck, UtensilsCrossed } from 'lucide-react';

const FeaturesSection = () => {
  
  const features = [
    {
      icon: <UtensilsCrossed size={32} className="text-green-500" />,
      title: "Meal Customization",
      description: "Tailor every meal to your taste and dietary needs, from ingredients to portion sizes.",
    },
    {
      icon: <Truck size={32} className="text-green-500" />,
      title: "Delivery to Major Cities",
      description: "We deliver fresh meals across Indonesia, ensuring you never miss a healthy bite.",
    },
    {
      icon: <Leaf size={32} className="text-green-500" />,
      title: "Detailed Nutritional Info",
      description: "Access complete nutritional information for every meal to stay on top of your health goals.",
    },
  ];

  return (
    // We use a white background for this section to create a nice contrast with the red hero section.
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Why Choose Us?</h2>
        <p className="text-gray-600 mt-2 mb-12">The best choice for your health and convenience.</p>
        
        {/* 'grid md:grid-cols-3' creates a 3-column grid on medium screens and up. 
            On small screens, it defaults to a single column, which is great for mobile. */}
        <div className="grid md:grid-cols-3 gap-12 text-left">
          
          {/* We loop through the 'features' array and create a card for each one. */}
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-100 p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;