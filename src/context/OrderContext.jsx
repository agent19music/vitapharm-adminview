'use client'
 
import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from './UserContext';


export const OrderContext = createContext({});

export default function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { authToken } = useContext(UserContext);

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.example.com'; // Replace with your API endpoint

  // Function to filter the orders based on the selected tab
 const filterOrders = useCallback((filter) => {
  const now = new Date();
  return orders.filter((order) => {
    const orderDate = new Date(order.transaction_date);
    switch (filter) {
      case 'week':
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        return orderDate >= oneWeekAgo && orderDate <= now;
      case 'lastWeek':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - 14);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - 7);
        return orderDate >= lastWeekStart && orderDate < lastWeekEnd;
      case 'month':
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= oneMonthAgo && orderDate <= now;
      case 'lastMonth':
        const lastMonthStart = new Date(now);
        lastMonthStart.setMonth(now.getMonth() - 2);
        const lastMonthEnd = new Date(now);
        lastMonthEnd.setMonth(now.getMonth() - 1);
        return orderDate >= lastMonthStart && orderDate < lastMonthEnd;
      case 'year':
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return orderDate >= oneYearAgo && orderDate <= now;
      default:
        return true;
    }
  });
}, [orders]);

console.log(orders);

  // Search items
  function searchOrders(query) {
    let lowerCaseQuery = query.toLowerCase();

    let filtered = orders && orders.filter(order => {
      let firstname = order.customerFirstName.toLowerCase();
      let lastname = order.customerLastName.toLowerCase();
      let email = order.customerEmail.toLowerCase();
      let paymentref = order.payment_reference ? order.payment_reference.toLowerCase() : "";
      let phone = order.phone.toLowerCase();
      let promocode = order.discount_code_applied.toLowerCase();

      return firstname.includes(lowerCaseQuery) || lastname.includes(lowerCaseQuery) || email.includes(lowerCaseQuery) || paymentref.includes(lowerCaseQuery) || phone.includes(lowerCaseQuery) || promocode.includes(lowerCaseQuery);
    });

    setFilteredOrders(filtered);
  }
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
        setSelectedOrder(data[data.length - 1]);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setIsLoading(false);
      });
  }, [authToken]);
  
  
    
  useEffect(() => {
    const filterPaidOrders = () => {
      const filtered = Array.isArray(orders) ? orders.filter(order => order.status === 'Paid') : [];
      setFilteredStatus(filtered);
    }
  
    filterPaidOrders();
  }, [orders]); // This will run every time 'orders' state changes
  

  return (
    <OrderContext.Provider value={{
      orders,
      filteredOrders,
      isLoading,
      filterOrders,
      calculateEarningsFromPaidOrders,
      selectedOrder,
      setSelectedOrder,
      searchOrders,
      filteredStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
}
