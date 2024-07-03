'use client'
 
import { createContext, useState, useEffect } from 'react'
 
export const OrderContext = createContext({})
 
export default function OrderProvider({ children }) {

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

     // Fetch orders
  useEffect(() => {
    setIsLoading(true);
    fetch('http://server-env.eba-8hpawwgj.eu-north-1.elasticbeanstalk.com/api/vitapharm/orders')
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