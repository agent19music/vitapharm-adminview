'use client'

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

export const AnalyticsContext = createContext({});

export default function AnalyticsProvider({ children }) {
    const [analytics, setAnalytics] = useState({
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        average_rating: 0,
        top_products: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const { authToken } = useContext(UserContext);

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';

    // Fetch seller analytics
    const fetchAnalytics = useCallback(async () => {
        if (!authToken) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}/seller/analytics`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics');
            }

            const data = await response.json();
            setAnalytics({
                total_revenue: data.total_revenue || 0,
                total_orders: data.total_orders || 0,
                total_products: data.total_products || 0,
                average_rating: data.average_rating || 0,
                top_products: data.top_products || []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, apiEndpoint]);

    // Format currency
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }, []);

    // Format number with thousands separator
    const formatNumber = useCallback((num) => {
        return new Intl.NumberFormat('en-KE').format(num);
    }, []);

    // Initial fetch
    useEffect(() => {
        if (authToken) {
            fetchAnalytics();
        }
    }, [authToken]);

    return (
        <AnalyticsContext.Provider value={{
            analytics,
            isLoading,
            fetchAnalytics,
            formatCurrency,
            formatNumber
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}
