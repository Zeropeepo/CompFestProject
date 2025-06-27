import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { DollarSign, Users, TrendingUp, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, 
} from 'chart.js';


ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);


type AdminStats = {
    newSubscriptions: number;
    monthlyRecurringRevenue: number;
    activeSubscriptions: number;
    reactivations: number;
    growthData: { date: string; count: number }[]; // NEW
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

    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
    });

    useEffect(() => {
        const fetchAdminStats = async () => {
            if (!startDate || !endDate) return;
            setLoading(true);
            const token = localStorage.getItem('sea-catering-token');
            if (!token) {
                setError("Authentication required.");
                setLoading(false);
                return;
            }
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];
            try {
                const response = await fetch(`${import.meta.env.VITE_DEPLOY_API_URL}/api/admin/dashboard-stats?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 403) throw new Error("Access Denied.");
                if (!response.ok) throw new Error("Failed to fetch statistics.");
                const data: AdminStats = await response.json();
                setStats(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, [startDate, endDate]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    };

    // NEW: Prepare data and options for the chart
    const chartData = {
        labels: stats?.growthData.map(d => d.date) || [],
        datasets: [
            {
                label: 'New Subscriptions',
                data: stats?.growthData.map(d => d.count) || [],
                fill: true,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="bg-gray-0 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 pt-24">
                <div className="pt-15 flex flex-wrap justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Business performance for the selected period.</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 bg-white p-2 rounded-lg shadow-sm border">
                        <CalendarIcon className="text-gray-500" size={20} />
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date as Date)} selectsStart startDate={startDate} endDate={endDate} className="w-24 md:w-28 bg-transparent focus:outline-none" />
                        <span className="text-gray-400">-</span>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date as Date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} className="w-24 md:w-28 bg-transparent focus:outline-none" />
                    </div>
                </div>
                
                {loading ? (
                    <p className="text-center py-10">Loading stats...</p>
                ) : error ? (
                    <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</p>
                ) : stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="MRR (in period)" value={formatPrice(stats.monthlyRecurringRevenue)} icon={DollarSign} colorClass="bg-green-500"/>
                            <StatCard title="New Subs (in period)" value={stats.newSubscriptions} icon={TrendingUp} colorClass="bg-yellow-500" />
                            <StatCard title="Reactivations (in period)" value={stats.reactivations} icon={RefreshCw} colorClass="bg-purple-500" />
                            <StatCard title="Total Active Subs" value={stats.activeSubscriptions} icon={Users} colorClass="bg-blue-500" />
                        </div>

                        <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">New Subscription Trends</h3>
                            {stats.growthData.length > 0 ? (
                                <Line options={chartOptions} data={chartData} />
                            ) : (
                                <p className="text-center text-gray-500 py-10">No new subscription data for this period.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;