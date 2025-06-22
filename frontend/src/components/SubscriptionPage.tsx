import React, { useState, useEffect } from 'react';

// --- Helper Data and Types ---
type PlanName = 'Diet Plan' | 'Protein Plan' | 'Royal Plan';
const PLAN_PRICES: Record<PlanName, number> = { 'Diet Plan': 30000, 'Protein Plan': 40000, 'Royal Plan': 60000 };
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
const DELIVERY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// --- Main Component ---
const SubscriptionPage = () => {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Protein Plan');
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['Lunch']);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [allergies, setAllergies] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const planPrice = PLAN_PRICES[selectedPlan];
    const numMealTypes = selectedMeals.length;
    const numDeliveryDays = selectedDays.length;

    if (numMealTypes > 0 && numDeliveryDays > 0) {
      const calculatedPrice = planPrice * numMealTypes * numDeliveryDays * 4.3;
      setTotalPrice(calculatedPrice);
    } else {
      setTotalPrice(0);
    }
  }, [selectedPlan, selectedMeals, selectedDays]);

  const handleMealToggle = (meal: string) => {
    setSelectedMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // HANDLING FORM SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeals.length === 0 || selectedDays.length === 0) {
      alert("Please select at least one meal type and one delivery day.");
      return;
    }

    setIsSubmitting(true); 
    setSubmitStatus(null); 

    const submissionData = { name, phone, selectedPlan, selectedMeals, selectedDays, allergies, totalPrice };

    try {

      const response = await fetch('http://localhost:8080/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
    
        throw new Error('Network response was not ok.');
      }

      
      setSubmitStatus('success');


    } catch (error) {
      console.error("Failed to submit subscription:", error);
      setSubmitStatus('error');
    } finally {
     
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-800">Create Your Subscription</h1>
            <p className="mt-4 text-lg text-gray-600">Customize your perfect healthy meal plan below.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-12 gap-y-8">

            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700 border-b pb-2">1. Your Details</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="form-mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none" required />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Active Phone Number *</label>
                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="form-mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Plan *</label>
                <div className="space-y-2">
                  {(Object.keys(PLAN_PRICES) as PlanName[]).map(plan => (
                    <label key={plan} className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all" style={{ borderColor: selectedPlan === plan ? '#22c55e' : '#e5e7eb' }}>
                      <input type="radio" name="plan" value={plan} checked={selectedPlan === plan} onChange={e => setSelectedPlan(e.target.value as PlanName)} className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />
                      <span className="ml-3 font-medium text-gray-800">{plan}</span>
                      <span className="ml-auto font-semibold text-green-600">{formatPrice(PLAN_PRICES[plan])}/meal</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN ABOUT MEALS */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700 border-b pb-2">2. Customize Your Meals</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type(s) *</label>
                <div className="grid grid-cols-3 gap-2">{MEAL_TYPES.map(meal => (<button type="button" key={meal} onClick={() => handleMealToggle(meal)} className={`p-2 border-2 rounded-md text-sm font-semibold transition-all ${selectedMeals.includes(meal) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}>{meal}</button>))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Days *</label>
                <div className="grid grid-cols-4 gap-2">{DELIVERY_DAYS.map(day => (<button type="button" key={day} onClick={() => handleDayToggle(day)} className={`p-2 border-2 rounded-md text-sm font-semibold transition-all ${selectedDays.includes(day) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}>{day.substring(0,3)}</button>))}</div>
              </div>
              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">Allergies or Dietary Restrictions (optional)</label>
                <textarea id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} rows={3} className="form-mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500 focus:outline-none"></textarea>
              </div>
              <div className="bg-green-100 p-6 rounded-lg text-center mt-6">
                <p className="text-sm font-medium text-green-800">ESTIMATED MONTHLY TOTAL</p>
                <p className="text-4xl font-extrabold text-green-700 my-2">{formatPrice(totalPrice)}</p>
                <p className="text-xs text-green-600">Calculated based on your selections. Billed monthly.</p>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors text-lg disabled:bg-gray-400">
                {isSubmitting ? 'Submitting...' : 'Subscribe Now'}
              </button>

              {/* --- NEW: Success and Error Messages --- */}
              {submitStatus === 'success' && <p className="text-green-600 font-semibold text-center mt-2">Subscription successful! Thank you for your order.</p>}
              {submitStatus === 'error' && <p className="text-red-600 font-semibold text-center mt-2">Something went wrong. Please try again later.</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;