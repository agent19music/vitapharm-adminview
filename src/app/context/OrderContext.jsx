'use client'
 
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';

export const OrderContext = createContext({});

export default function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken } = useContext(UserContext);

  const apiEndpoint = 'http://127.0.0.1:5000/api/vitapharm';

  // Function to filter the orders based on the selected tab
  const filterOrders = useCallback((filter) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.transaction_date);
      switch (filter) {
        case 'week':
          const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
          return orderDate >= oneWeekAgo;
        case 'month':
          const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return orderDate >= oneMonthAgo;
        case 'year':
          const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
          return orderDate >= oneYearAgo;
        default:
          return true;
      }
    });
  }, [orders]);

  // Function to calculate the total earnings from the filtered orders
 // Function to calculate the total earnings from the paid orders
const calculateEarningsFromPaidOrders = useCallback((orders) => {
  return orders.reduce((total, order) => {
    if (order.status === "Paid") {
      return total + order.discounted_total;
    } else {
      return total;
    }
  }, 0);
}, []);

  // Fetch orders
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
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
  }, [authToken]);

  return (
    <OrderContext.Provider value={{
      orders,
      filteredOrders,
      isLoading,
      filterOrders,
      calculateEarningsFromPaidOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
}
