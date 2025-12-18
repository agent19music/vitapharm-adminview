'use client'

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

export const PayoutContext = createContext({});

export default function PayoutProvider({ children }) {
    const [earnings, setEarnings] = useState({
        pending_earnings: 0,
        total_paid_out: 0
    });
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const { authToken, seller } = useContext(UserContext);

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';

    // Fetch earnings and payout history
    const fetchEarnings = useCallback(async () => {
        if (!authToken) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}/seller/earnings`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch earnings');
            }

            const data = await response.json();
            setEarnings({
                pending_earnings: data.pending_earnings || 0,
                total_paid_out: data.total_paid_out || 0
            });
            setPayoutHistory(data.payout_history || []);
        } catch (error) {
            console.error('Error fetching earnings:', error);
            toast.error('Failed to load earnings');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, apiEndpoint]);

    // Request a payout
    const requestPayout = useCallback(async (amount, phoneNumber = null) => {
        if (!authToken) return { success: false, error: 'Not authenticated' };

        if (amount <= 0) {
            toast.error('Please enter a valid amount');
            return { success: false, error: 'Invalid amount' };
        }

        if (amount > earnings.pending_earnings) {
            toast.error('Insufficient balance');
            return { success: false, error: 'Insufficient balance' };
        }

        setIsRequesting(true);
        try {
            const response = await fetch(`${apiEndpoint}/seller/payouts/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    phone_number: phoneNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to request payout');
            }

            // Refresh earnings after successful request
            await fetchEarnings();

            toast.success('Payout request submitted successfully');
            return { success: true, data };

        } catch (error) {
            console.error('Error requesting payout:', error);
            toast.error(error.message || 'Failed to request payout');
            return { success: false, error: error.message };
        } finally {
            setIsRequesting(false);
        }
    }, [authToken, apiEndpoint, earnings.pending_earnings, fetchEarnings]);

    // Format currency
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }, []);

    // Initial fetch
    useEffect(() => {
        if (authToken) {
            fetchEarnings();
        }
    }, [authToken]);

    return (
        <PayoutContext.Provider value={{
            earnings,
            payoutHistory,
            isLoading,
            isRequesting,
            fetchEarnings,
            requestPayout,
            formatCurrency
        }}>
            {children}
        </PayoutContext.Provider>
    );
}
