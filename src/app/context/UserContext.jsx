'use client'
 
import { createContext, useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation';

 
export const UserContext = createContext({})
 
export default function UserProvider({ children }) {
  const { toast } = useToast();
  const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null)
    const [authToken, setAuthToken] = useState(() => {
      if (typeof window !== 'undefined') {
          return sessionStorage.getItem('authToken') ? sessionStorage.getItem('authToken') : null;
      }
      return null;
  });
  
      const [onchange, setOnchange] = useState(false)  

    const apiEndpoint = ' http://127.0.0.1:5000/api/vitapharm'

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
            toast({
              title: "Login successful.",
              description: "You are now logged in.",
            });
            setOnchange(!onchange);
            router.push('/products');
          } else {
            toast({
              title: "Login failed.",
              description: "Incorrect username or password",
            });
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
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

   // Get Authenticated user
   useEffect(() => {
    if (authToken) {
      fetch(`${apiEndpoint}/admin/authenticated_user`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.email) {
            setCurrentUser(response)
          } else {
            setCurrentUser(null)
          }
        })
    }
  }, [authToken, onchange])

  const updateUserContext = () => {
    fetch(`${apiEndpoint}/authenticated_user`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.email || response.username) {
          setCurrentUser(response)
        } else {
          setCurrentUser(null)
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  };
    

   
  

  return <UserContext.Provider value={{
    login,
    logout,
    currentUser,
    authToken,
    onchange,
    setOnchange, 
    apiEndpoint,
    updateUserContext
    
  }}>{children}</UserContext.Provider>
}