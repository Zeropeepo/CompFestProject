import React, { useState, useEffect } from 'react';

// This global declaration is correct for using the Midtrans Snap script.
declare global {
  interface Window {
    snap: {
      pay: (snapToken: string, options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

// --- Helper Data and Types (Unchanged) ---
type PlanName = 'Diet Plan' | 'Protein Plan' | 'Royal Plan';
const PLAN_PRICES: Record<PlanName, number> = { 'Diet Plan': 30000, 'Protein Plan': 40000, 'Royal Plan': 60000 };
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
const DELIVERY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type SubscriptionPageProps = {
  currentUser: UserProfile; 
};

// --- Main Component ---
const SubscriptionPage = ({ currentUser }: SubscriptionPageProps) => {

  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Protein Plan');
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['Lunch']);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [allergies, setAllergies] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | 'info' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // useEffect for price calculation is correct. (Unchanged)
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

  // Helper functions for toggling selections are correct. (Unchanged)
  const handleMealToggle = (meal: string) => {
    setSelectedMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]);
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // HANDLING FORM SUBMISSION (Corrected Logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeals.length === 0 || selectedDays.length === 0) {
      alert("Please select at least one meal type and one delivery day.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setStatusMessage('Creating your subscription...');

    const token = localStorage.getItem('sea-catering-token');
    const csrfToken = localStorage.getItem('sea-catering-csrf');

    try {
      // --- Step 1: Create a subscription with "pending" status (Unchanged) ---
      const subData = {
        name: currentUser.fullName, phone, selectedPlan, selectedMeals,
        selectedDays, allergies, totalPrice
      };

      const subResponse = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify(subData),
      });

      if (!subResponse.ok) throw new Error('Failed to create subscription record.');
      
      const subResult = await subResponse.json();
      const { subscriptionId } = subResult;
      
      if (!subscriptionId) throw new Error('Subscription ID not received from server.');

      setStatusMessage('Subscription created. Generating payment link...');

      // --- Step 2: Create a Midtrans payment transaction (Corrected) ---
      // FIX: Use the correct endpoint with the ID in the URL.
      // FIX: Use a POST request with no body, as the backend handles it.
      const paymentResponse = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscriptions/${subscriptionId}/create-payment`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'X-CSRF-Token': csrfToken || '',
          },
      });

      if (!paymentResponse.ok) throw new Error('Failed to create payment transaction.');

      const paymentResult = await paymentResponse.json();
      const { snapToken } = paymentResult;

      // --- Step 3: Open the Midtrans Snap payment pop-up (Corrected State Handling) ---
      if (snapToken) {
          window.snap.pay(snapToken, {
              onSuccess: (result) => {
                  setSubmitStatus('success');
                  setStatusMessage(`Payment successful! Transaction ID: ${result.transaction_id}`);
                  setIsSubmitting(false); 
              },
              onPending: (result) => {
                  setSubmitStatus('info');
                  setStatusMessage(`Your payment is pending. Order ID: ${result.order_id}`);
                  setIsSubmitting(false); 
              },
              onError: (result) => {
                  setSubmitStatus('error');
                  setStatusMessage(`Payment failed. Please try again. Message: ${result.status_message}`);
                  setIsSubmitting(false); 
              },
              onClose: () => {
                  // Only set a message if payment was not already successful
                  if (submitStatus !== 'success') {
                      setSubmitStatus('info');
                      setStatusMessage('Payment window closed. Your subscription is awaiting payment.');
                      setIsSubmitting(false); 
                  }
              }
          });
      }

    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage(error instanceof Error ? error.message : "An unknown error occurred.");
      setIsSubmitting(false); // Also reset loading state on initial fetch errors
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

            {/* LEFT COLUMN (Unchanged) */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-700 border-b pb-2">1. Your Details</h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-gray-500">Subscribing as:</p>
                  <p className="text-lg font-semibold text-gray-800">{currentUser.fullName}</p>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
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

            {/* RIGHT COLUMN (Unchanged except for status message) */}
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
                {isSubmitting ? statusMessage : 'Subscribe & Pay Now'}
              </button>

              {/* --- FIX: Dynamic Status Message Display --- */}
              {statusMessage && (
                <div className={`text-center mt-2 font-semibold ${
                    submitStatus === 'success' ? 'text-green-600' : 
                    submitStatus === 'error' ? 'text-red-600' : 
                    'text-yellow-600'
                }`}>
                  {statusMessage}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;