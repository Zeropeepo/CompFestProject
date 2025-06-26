import { useState, useEffect } from 'react';


type Subscription = {
    id: number;
    planName: string;
    mealTypes: string[];
    deliveryDays: string[];
    totalPrice: number;
    status: string;
};

const UserDashboardPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const token = localStorage.getItem('sea-catering-token');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/subscriptions', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions. Please try again later.');
        }

        const data: Subscription[] = await response.json();
        setSubscriptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

 const handleUpdateStatus = async (subscriptionId: number, newStatus: 'paused' | 'cancelled' | 'active') => {
    // Confirm the action with the user
    if (!window.confirm(`Are you sure you want to ${newStatus} this subscription?`)) {
      return;
    }

    const token = localStorage.getItem('sea-catering-token');
    const csrfToken = localStorage.getItem('sea-catering-csrf'); // Get the CSRF token

    try {
        const response = await fetch(`http://localhost:8080/api/subscriptions/${subscriptionId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-CSRF-Token': csrfToken || '', // Include the CSRF token header
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${newStatus} subscription.`);
        }
        
        // Update the UI without a page refresh
        setSubscriptions(prevSubs => 
            prevSubs.map(sub => 
                sub.id === subscriptionId ? { ...sub, status: newStatus } : sub
            )
        );

        alert(`Subscription successfully ${newStatus}.`);
    } catch (error) {
        alert((error as Error).message);
    }
  };

  // Helper Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) {
    return <div className="container mx-auto p-8 pt-24 text-center">Loading your subscriptions...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 pt-24 text-center text-red-500">{error}</div>;
  }

  return (
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
                                <p className="text-gray-500 text-sm">Subscribed on: {new Date().toLocaleDateString()}</p>
                            </div>
                            <span className={`capitalize px-3 py-1 text-sm font-semibold rounded-full ${
                                sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                                sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
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
                        
                        <div className="mt-6 flex items-center space-x-4">
                            {/* --- UPDATED BUTTON LOGIC --- */}
                            
                            {/* Show Resume button ONLY if status is 'paused' */}
                            {sub.status === 'paused' && (
                                <button 
                                    onClick={() => handleUpdateStatus(sub.id, 'active')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700"
                                >
                                    Resume
                                </button>
                            )}

                            {/* Show Pause button ONLY if status is 'active' */}
                            {sub.status === 'active' && (
                                <button 
                                    onClick={() => handleUpdateStatus(sub.id, 'paused')}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600"
                                >
                                    Pause
                                </button>
                            )}

                            {/* Show Cancel button if status is NOT 'cancelled' */}
                            {sub.status !== 'cancelled' && (
                                <button 
                                    onClick={() => handleUpdateStatus(sub.id, 'cancelled')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                ))
                ) : (
                <div className="text-center bg-white p-8 rounded-lg shadow-sm">
                    <p className="font-semibold text-gray-700">You have no subscriptions yet.</p>
                    <p className="text-gray-500 mt-2">Ready to start your health journey?</p>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default UserDashboardPage;