// in UserDashboardPage.tsx

import { useState, useEffect } from 'react';
import { Sparkles, CreditCard } from 'lucide-react'; // Import a nice icon for the AI and Pay buttons
import Modal from './Modal';

// This global declaration is correct for using the Midtrans Snap script.
// Add this to your file if it's not already there.
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


// Type for a single subscription, matching the data from your API
type Subscription = {
    id: number;
    planName: string;
    mealTypes: string[];
    deliveryDays: string[];
    totalPrice: number;
    status: string;
};

// Type for our AI recommendation results from the Gemini API
type Recommendation = {
  name: string;
  description: string;
};

const UserDashboardPage = () => {
  // --- Existing State ---
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW: State for the AI Feature ---
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isFetchingAI, setIsFetchingAI] = useState<number | null>(null); // Store the ID of the subscription being fetched
  const [aiError, setAiError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- NEW: State for the payment process ---
  const [isPaying, setIsPaying] = useState<number | null>(null); // Store ID of sub being paid


  useEffect(() => {
    // This useEffect for fetching the initial list of subscriptions remains unchanged
    const fetchSubscriptions = async () => {
      const token = localStorage.getItem('sea-catering-token');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscriptions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions. Please try again later.');
        }
        const data: Subscription[] = await response.json();
        setSubscriptions(data);
      } catch (err)
 {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);
  
  const handleUpdateStatus = async (subscriptionId: number, newStatus: 'paused' | 'cancelled' | 'active') => {
    // This function for pausing/cancelling subscriptions remains unchanged
    if (!window.confirm(`Are you sure you want to ${newStatus} this subscription?`)) {
        return;
    }
    const token = localStorage.getItem('sea-catering-token');
    const csrfToken = localStorage.getItem('sea-catering-csrf');
    try {
        const response = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscriptions/${subscriptionId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-CSRF-Token': csrfToken || '' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${newStatus} subscription.`);
        }
        setSubscriptions(prevSubs => prevSubs.map(sub => sub.id === subscriptionId ? { ...sub, status: newStatus } : sub));
        alert(`Subscription successfully ${newStatus}.`);
    } catch (error) {
        alert((error as Error).message);
    }
  };

  // --- NEW: Function to handle payment for a pending subscription ---
  const handlePayNow = async (subscriptionId: number) => {
    setIsPaying(subscriptionId);
    const token = localStorage.getItem('sea-catering-token');
    const csrfToken = localStorage.getItem('sea-catering-csrf');

    try {
      const paymentResponse = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscriptions/${subscriptionId}/create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || '',
        },
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment transaction.');
      }

      const paymentResult = await paymentResponse.json();
      const { snapToken } = paymentResult;

      if (snapToken) {
        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            alert('Payment successful! Your subscription will be activated shortly.');
            // Optimistically update the UI. The webhook is the source of truth, but this gives immediate feedback.
            setSubscriptions(prev => prev.map(sub => 
              sub.id === subscriptionId ? { ...sub, status: 'active' } : sub
            ));
          },
          onPending: (result) => {
            alert('Your payment is pending. We will update the status upon confirmation.');
          },
          onError: (result) => {
            alert(`Payment failed. Please try again. Reason: ${result.status_message}`);
          },
          onClose: () => {
            // Payment window closed without a successful transaction.
          }
        });
      }
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsPaying(null); // Clear loading state for the pay button
    }
  };


  // Handling AI Recommendations
  const handleGetRecommendation = async (subscriptionId: number) => {
    setIsFetchingAI(subscriptionId); // Set the loading state for this specific button
    setAiError(null);
    setRecommendations([]);

    const token = localStorage.getItem('sea-catering-token');
    const csrfToken = localStorage.getItem('sea-catering-csrf');

    try {
      const response = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/subscriptions/${subscriptionId}/ai-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({ subscriptionId: subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations from the server.');
      }
      
      const data: Recommendation[] = await response.json();
      setRecommendations(data);
      setIsModalOpen(true); // Open the modal to show the results
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'An unknown error occurred.');
      setIsModalOpen(true); // Open the modal to show the error
    } finally {
      setIsFetchingAI(null); // Clear the loading state regardless of outcome
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) return <div className="container mx-auto p-8 pt-24 text-center">Loading your subscriptions...</div>;
  if (error) return <div className="container mx-auto p-8 pt-24 text-center text-red-500">{error}</div>;

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto p-8 pt-24">
              <h1 className="text-3xl font-bold text-gray-800">My Subscriptions</h1>
              <p className="mt-2 text-gray-600">View and manage your active and past subscriptions.</p>
              
              <div className="mt-8 space-y-6">
                  {subscriptions.length > 0 ? (
                  subscriptions.map(sub => (
                      <div key={sub.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h2 className="text-xl font-bold text-gray-800">{sub.planName}</h2>
                              </div>
                              <span className={`capitalize px-3 py-1 text-sm font-semibold rounded-full ${ 
                                  sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                  sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                  sub.status === 'pending' ? 'bg-blue-100 text-blue-800' : // Style for pending
                                  'bg-red-100 text-red-800'
                              }`}>
                                  {sub.status}
                              </span>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                              <p><strong>Total Price:</strong> {formatPrice(sub.totalPrice)} / month</p>
                              <p><strong>Meal Types:</strong> {sub.mealTypes.join(', ')}</p>
                              <p><strong>Delivery Days:</strong> {sub.deliveryDays.join(', ')}</p>
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-4">
                              {/* --- MODIFIED BUTTONS AREA --- */}

                              {/* PAY NOW button for pending subscriptions */}
                              {sub.status === 'pending' && (
                                <button 
                                  onClick={() => handlePayNow(sub.id)}
                                  disabled={isPaying === sub.id}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
                                >
                                  <CreditCard size={16} />
                                  {isPaying === sub.id ? 'Processing...' : 'Pay Now'}
                                </button>
                              )}

                              {/* Pause/Resume buttons */}
                              {sub.status === 'paused' && <button onClick={() => handleUpdateStatus(sub.id, 'active')} className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700">Resume</button>}
                              {sub.status === 'active' && <button onClick={() => handleUpdateStatus(sub.id, 'paused')} className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600">Pause</button>}
                              
                              {/* Cancel button */}
                              {(sub.status === 'active' || sub.status === 'paused' || sub.status === 'pending') && (
                                <button onClick={() => handleUpdateStatus(sub.id, 'cancelled')} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700">Cancel</button>
                              )}

                              {/* AI Recommendation Button --- */}
                              <button
                                type="button"
                                onClick={() => handleGetRecommendation(sub.id)}
                                disabled={isFetchingAI === sub.id}
                                className="flex-grow md:flex-grow-0 flex justify-center items-center gap-2 py-2 px-4 border-2 border-green-600 rounded-md shadow-sm text-sm font-bold text-green-600 bg-white hover:bg-green-50 focus:outline-none disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300 transition-colors"
                              >
                                <Sparkles size={16} />
                                {isFetchingAI === sub.id ? 'Thinking...' : 'AI Meal Ideas'}
                              </button>
                          </div>
                      </div>
                  ))
                  ) : (
                  <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                      <p className="font-semibold text-gray-700">You have no subscriptions yet.</p>
                  </div>
                  )}
              </div>
          </div>
      </div>

      {/* Modal to display AI results --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-full">
              <Sparkles className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
          </div>
          {aiError ? (
            <p className="text-red-500">{aiError}</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {isFetchingAI !== null ? (
                <p>Loading recommendations...</p>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3">
                    <h3 className="font-semibold text-lg text-gray-800">{rec.name}</h3>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                ))
              ) : (
                <p>No recommendations to show.</p>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default UserDashboardPage;