'use client'

import { createContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';


export const UserContext = createContext({})

export default function UserProvider({ children }) {
  const router = useRouter();
  const [sellerProfile, setSellerProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [authToken, setAuthToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  const mainLoginUrl = process.env.NEXT_PUBLIC_MAIN_APP_LOGIN_URL
  const sellerSignupUrl = process.env.NEXT_PUBLIC_MAIN_APP_SELLER_SIGNUP_URL

  const redirectToLogin = useCallback(() => {
    if (typeof window === 'undefined') return
    const destination = mainLoginUrl || 'https://camposocial.app/login'
    window.location.href = destination
  }, [mainLoginUrl])

  const redirectToSellerSignup = useCallback(() => {
    if (typeof window === 'undefined') return
    const destination = sellerSignupUrl || 'https://camposocial.app/marketplace/sellersignup'
    window.location.href = destination
  }, [sellerSignupUrl])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/clear-token', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error clearing auth cookie:', error)
    }
    setSellerProfile(null)
    setAuthToken(null)
    setAppointments([])
    router.push('/')
  }, [router])

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // First check URL params (for local dev cross-port redirect)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search)
          const urlToken = urlParams.get('token')

          if (urlToken) {
            setAuthToken(urlToken)
            sessionStorage.setItem('authToken', urlToken)
            // Clean URL by removing token param
            urlParams.delete('token')
            const newUrl = urlParams.toString()
              ? `${window.location.pathname}?${urlParams.toString()}`
              : window.location.pathname
            window.history.replaceState({}, '', newUrl)
            setIsLoading(false)
            return
          }
        }

        // Then check cookie via API
        const response = await fetch('/api/auth/get-token')
        const data = await response.json()
        if (data.token) {
          setAuthToken(data.token)
          // Sync with sessionStorage for WithAuth HOC
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('authToken', data.token)
          }
        } else {
          setAuthToken(null)
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('authToken')
          }
        }
      } catch (error) {
        console.error('Error retrieving auth token:', error)
        setAuthToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [])

  useEffect(() => {
    if (!authToken || !apiEndpoint) {
      setSellerProfile(null)
      return
    }

    const controller = new AbortController()

    const fetchSellerProfile = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/seller/me`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          signal: controller.signal,
        })

        if (response.status === 401) {
          redirectToLogin()
          return
        }

        const data = await response.json()

        if (!response.ok || !data.is_seller) {
          toast.error('Seller profile not found. Please complete seller signup.')
          redirectToSellerSignup()
          return
        }

        setSellerProfile(data.seller)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching seller profile:', error)
          toast.error('Failed to load seller profile')
        }
      }
    }

    fetchSellerProfile()

    return () => controller.abort()
  }, [apiEndpoint, authToken, redirectToLogin, redirectToSellerSignup])

  useEffect(() => {
    if (!authToken || !sellerProfile || !apiEndpoint) {
      setAppointments([])
      return
    }

    // TODO: Enable when seller appointments endpoint exists
    // Currently no /book endpoint - skip this call
    setAppointments([])

  }, [apiEndpoint, authToken, sellerProfile])

  const filterAppointments = useCallback((filter) => {
    const now = new Date();
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.createdAt);
      switch (filter) {
        case 'week':
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          return appointmentDate >= oneWeekAgo && appointmentDate <= now;
        case 'lastWeek':
          const lastWeekStart = new Date(now);
          lastWeekStart.setDate(now.getDate() - 14);
          const lastWeekEnd = new Date(now);
          lastWeekEnd.setDate(now.getDate() - 7);
          return appointmentDate >= lastWeekStart && appointmentDate < lastWeekEnd;
        case 'month':
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return appointmentDate >= oneMonthAgo && appointmentDate <= now;
        case 'lastMonth':
          const lastMonthStart = new Date(now);
          lastMonthStart.setMonth(now.getMonth() - 2);
          const lastMonthEnd = new Date(now);
          lastMonthEnd.setMonth(now.getMonth() - 1);
          return appointmentDate >= lastMonthStart && appointmentDate < lastMonthEnd;
        case 'year':
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return appointmentDate >= oneYearAgo && appointmentDate <= now;
        default:
          return true;
      }
    });
  }, [appointments]);




  return <UserContext.Provider value={{
    authToken,
    sellerProfile,
    appointments,
    filterAppointments,
    isLoading,
    redirectToLogin,
    logout,
    apiEndpoint,
  }}>{children}</UserContext.Provider>
}