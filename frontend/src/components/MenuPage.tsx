import React from 'react';
import Modal from './Modal'; 


type MealPlan = {
  name: string;
  price: string;
  description: string;
  image: string;
  details: string[]; 
};

// Sample data
const mealPlans: MealPlan[] = [
  {
    name: 'Diet Plan',
    price: 'Rp 30.000 / meal',
    description: 'Perfectly balanced meals to help you achieve your weight goals without sacrificing flavor.',
    image: '/icons/healthy_plan.png',
    details: [
      'Calorie-controlled portions',
      'High in fiber and vitamins',
      'Low in saturated fats',
      'Includes lean proteins and complex carbs'
    ],
  },
  {
    name: 'Protein Plan',
    price: 'Rp 40.000 / meal',
    description: 'Fuel your fitness journey with high-protein meals designed to build muscle and aid recovery.',
    image: '/icons/protein_plan.png',
    details: [
      'At least 30g of protein per meal',
      'Sourced from high-quality lean meats and fish',
      'Includes essential amino acids for muscle repair',
      'Great for post-workout recovery'
    ],
  },
  {
    name: 'Royal Plan',
    price: 'Rp 60.000 / meal',
    description: 'Indulge in our premium selection of gourmet healthy meals, crafted with the finest ingredients.',
    image: '/icons/royal_plan.png',
    details: [
      'Features premium ingredients like salmon and steak',
      'Complex, chef-designed flavor profiles',
      'Organic vegetables and artisanal grains',
      'The ultimate healthy luxury experience'
    ],
  },
];

const MenuPage = () => {

  const [selectedPlan, setSelectedPlan] = React.useState<MealPlan | null>(null);

  return (
    <div className="container mx-auto pt-28 p-4 sm:p-8">
      <div className="text-center mb-16 pt-12">
        <h1 className="text-4xl font-extrabold text-gray-800">Our Meal Plans</h1>
        <p className="mt-4 text-lg text-gray-600">Deliciously healthy, crafted for you.</p>
      </div>

      <div className="space-y-20">
        {mealPlans.map((plan, index) => (
  
          <div key={plan.name} className="grid md:grid-cols-2 gap-12 items-center">

            <div className={`flex justify-center pb-10 ${index % 2 !== 0 ? 'md:order-2' : ''}`}>
              <img src={plan.image} alt={plan.name} className="rounded-lg shadow-xl w-full" />
            </div>

            <div className={`text-center md:text-left ${index % 2 !== 0 ? 'md:order-1' : ''}`}>
              <h2 className="text-3xl font-bold text-gray-800">{plan.name}</h2>
              <p className="text-xl font-semibold text-green-600 my-2">{plan.price}</p>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <button
                onClick={() => setSelectedPlan(plan)}
                className="bg-gray-800 text-white font-bold hover:bg-gray-700 px-6 py-2 rounded-md transition-colors"
              >
                See More Details
              </button>
            </div>
          </div>
        ))}
      </div>


      <Modal isOpen={selectedPlan !== null} onClose={() => setSelectedPlan(null)}>
        {selectedPlan && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedPlan.name}</h2>
            <img src={selectedPlan.image} alt={selectedPlan.name} className="rounded-lg w-full mb-4" />
            <p className="text-lg font-semibold text-green-600 mb-2">{selectedPlan.price}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {selectedPlan.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MenuPage;

