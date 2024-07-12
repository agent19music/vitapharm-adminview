'use client'
 
import { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import {toast} from 'react-hot-toast';

 
export const UserContext = createContext({})
 
export default function UserProvider({ children }) {
  const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [authToken, setAuthToken] = useState(() => {
      if (typeof window !== 'undefined') {
          return sessionStorage.getItem('authToken') ? sessionStorage.getItem('authToken') : null;
      }
      return null;
  });
  
      const [onchange, setOnchange] = useState(false)  

    // const apiEndpoint = ' http://127.0.0.1:5000/api/vitapharm'
    const apiEndpoint = 'http://vitapharm-server-env.eba-k5q68s3p.eu-north-1.elasticbeanstalk.com/api/vitapharm'


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

   
  

  return <UserContext.Provider value={{
    login,
    logout,
    currentUser,
    authToken,
    onchange,
    setOnchange, 
    apiEndpoint,
    appointments
    
  }}>{children}</UserContext.Provider>
}