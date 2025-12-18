'use client'

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

export const ReviewContext = createContext({});

export default function ReviewProvider({ children }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        count: 0,
        average_rating: 0,
        rating_distribution: {}
    });
    const [isLoading, setIsLoading] = useState(false);
    const { authToken } = useContext(UserContext);

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';

    // Fetch reviews
    const fetchReviews = useCallback(async () => {
        if (!authToken) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}/seller/reviews`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            setReviews(data.reviews || []);
            setStats({
                count: data.count || 0,
                average_rating: data.average_rating || 0,
                rating_distribution: data.rating_distribution || {}
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, apiEndpoint]);

    // Reply to review
    const replyToReview = useCallback(async (reviewId, text) => {
        if (!authToken) return { success: false };

        try {
            const response = await fetch(`${apiEndpoint}/seller/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to reply');

            // Update local state
            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, replies: [...(r.replies || []), { text, created_at: new Date().toISOString() }] }
                    : r
            ));

            toast.success(data.message || 'Reply added');
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, error: error.message };
        }
    }, [authToken, apiEndpoint]);

    // Initial fetch
    useEffect(() => {
        if (authToken) {
            fetchReviews();
        }
    }, [authToken]);

    return (
        <ReviewContext.Provider value={{
            reviews,
            stats,
            isLoading,
            fetchReviews,
            replyToReview
        }}>
            {children}
        </ReviewContext.Provider>
    );
}
