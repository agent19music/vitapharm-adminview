'use client'
 
import { createContext, useState, useEffect } from 'react'
 
export const OrderContext = createContext({})
 
export default function OrderProvider({ children }) {

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const apiEndpoint = 'http://127.0.0.1:5000/api/vitapharm'


     // Fetch orders
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/orders`)
      .then(response => response.json())
      .then(data => {
        setOrders(data);
        setFilteredOrders(data); 
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      });
  }, []);

  return <OrderContext.Provider value={{
    orders,
    filteredOrders,
    isLoading
    
  }}>{children}</OrderContext.Provider>
}