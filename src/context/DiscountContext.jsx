'use client'

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

export const DiscountContext = createContext({});

export default function DiscountProvider({ children }) {
    const [discounts, setDiscounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { authToken } = useContext(UserContext);

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';

    // Fetch discounts
    const fetchDiscounts = useCallback(async () => {
        if (!authToken) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}/seller/discounts`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch discounts');

            const data = await response.json();
            setDiscounts(data.discounts || []);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            toast.error('Failed to load discounts');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, apiEndpoint]);

    // Create discount
    const createDiscount = useCallback(async (discountData) => {
        if (!authToken) return { success: false };

        try {
            const response = await fetch(`${apiEndpoint}/seller/discounts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(discountData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create discount');

            await fetchDiscounts();
            toast.success('Discount created successfully');
            return { success: true, data };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error: error.message };
        }
    }, [authToken, apiEndpoint, fetchDiscounts]);

    // Update discount
    const updateDiscount = useCallback(async (discountId, discountData) => {
        if (!authToken) return { success: false };

        try {
            const response = await fetch(`${apiEndpoint}/seller/discounts/${discountId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(discountData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update discount');

            await fetchDiscounts();
            toast.success('Discount updated');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error: error.message };
        }
    }, [authToken, apiEndpoint, fetchDiscounts]);

    // Delete discount
    const deleteDiscount = useCallback(async (discountId) => {
        if (!authToken) return { success: false };

        try {
            const response = await fetch(`${apiEndpoint}/seller/discounts/${discountId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete discount');

            setDiscounts(prev => prev.filter(d => d.id !== discountId));
            toast.success('Discount deleted');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false };
        }
    }, [authToken, apiEndpoint]);

    // Toggle discount active status
    const toggleDiscount = useCallback(async (discountId, isActive) => {
        return updateDiscount(discountId, { is_active: isActive });
    }, [updateDiscount]);

    // Initial fetch
    useEffect(() => {
        if (authToken) {
            fetchDiscounts();
        }
    }, [authToken]);

    return (
        <DiscountContext.Provider value={{
            discounts,
            isLoading,
            fetchDiscounts,
            createDiscount,
            updateDiscount,
            deleteDiscount,
            toggleDiscount
        }}>
            {children}
        </DiscountContext.Provider>
    );
}
