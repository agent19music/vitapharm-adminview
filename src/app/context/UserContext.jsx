'use client'
 
import { createContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import {toast} from 'react-hot-toast';

 
export const UserContext = createContext({})
 
export default function UserProvider({ children }) {
  const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [authToken, setAuthToken] = useState(() => {
      if (typeof window !== 'undefined') {
          return sessionStorage.getItem('authToken') ? sessionStorage.getItem('authToken') : null;
      }
      return null;
  });

  
      const [onchange, setOnchange] = useState(false)  

    const apiEndpoint = 'https://www.vitapharmcosmetics.co.ke/api/vitapharm'
    // const apiEndpoint = 'http://vitapharm-server-env.eba-k5q68s3p.eu-north-1.elasticbeanstalk.com/api/vitapharm'


    function login(email, password) {
      fetch(`${apiEndpoint}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
        .then((res) => res.json())
        .then((response) => {
          console.log('Server response:', response); // Log the server response
          if (response.access_token) {
            sessionStorage.setItem('authToken', response.access_token);
            setAuthToken(response.access_token);
            toast.success("You are now logged in."); // Success toast
            setOnchange(!onchange);
            router.push('/products');
          } else {
            toast.error("Incorrect username or password"); // Error toast
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
          toast.error('Error logging in'); // Error toast
        });
    }
    
       // Logout user
   function logout() {
    sessionStorage.removeItem('authToken')
    setCurrentUser(null)
    setAuthToken(null)
    setOnchange(!onchange)
    router.push('/')
  }

  //  // Get Authenticated user
  //  useEffect(() => {
  //   if (authToken) {
  //     fetch(`${apiEndpoint}/admin/authenticated_user`, {
  //       method: 'GET',
  //       headers: {
  //         Accept: 'application/json',
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((response) => {
  //         if (response.email) {
  //           setCurrentUser(response)
  //         } else {
  //           setCurrentUser(null)
  //         }
  //       })
  //   }
  // }, [authToken, onchange])

  // const updateUserContext = () => {
  //   fetch(`${apiEndpoint}/authenticated_user`, {
  //     method: 'GET',
  //     headers: {
  //       Accept: 'application/json',
  //       Authorization: `Bearer ${authToken}`,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((response) => {
  //       if (response.email || response.username) {
  //         setCurrentUser(response)
  //       } else {
  //         setCurrentUser(null)
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching user data:', error);
  //     });
  // };

useEffect(()=>{
  if (authToken) {
        fetch(`${apiEndpoint}/book`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })
          .then((res) => res.json())
          .then((response) => {
            if (response.email) {
              setAppointments(response)
            } else {
              setAppointments([])
            }
          })
      }
    }, [authToken])

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
    login,
    logout,
    currentUser,
    authToken,
    onchange,
    setOnchange, 
    apiEndpoint,
    appointments,
    filterAppointments,
    selectedAppointment,
    setSelectedAppointment
    
  }}>{children}</UserContext.Provider>
}