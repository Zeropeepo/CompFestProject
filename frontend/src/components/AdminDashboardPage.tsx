
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, RefreshCw } from 'lucide-react';

type AdminStats = {
    newSubscriptions: number;
    monthlyRecurringRevenue: number;
    activeSubscriptions: number;
    reactivations: number;
};


const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: React.ElementType, colorClass: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="text-white" size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const AdminDashboardPage = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            const token = localStorage.getItem('sea-catering-token');
            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/admin/dashboard-stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 403) {
                    throw new Error("Access Denied: You do not have permission to view this page.");
                }
                if (!response.ok) {
                    throw new Error("Failed to fetch admin statistics.");
                }

                const data: AdminStats = await response.json();
                setStats(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    if (loading) {
        return <div className="p-8 pt-24 text-center">Loading Admin Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 pt-24 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-8 pt-24">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome! Here's your business snapshot.</p>
                
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        <StatCard 
                            title="Monthly Recurring Revenue" 
                            value={formatPrice(stats.monthlyRecurringRevenue)} 
                            icon={DollarSign} 
                            colorClass="bg-green-500"
                        />
                        <StatCard 
                            title="Active Subscriptions" 
                            value={stats.activeSubscriptions} 
                            icon={Users} 
                            colorClass="bg-blue-500"
                        />
                        <StatCard 
                            title="Total Subscriptions (All Time)" 
                            value={stats.newSubscriptions} 
                            icon={TrendingUp} 
                            colorClass="bg-yellow-500"
                        />
                        <StatCard 
                            title="Reactivations" 
                            value={stats.reactivations} 
                            icon={RefreshCw} 
                            colorClass="bg-purple-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;