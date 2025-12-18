'use client'

import { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { UserContext } from './UserContext';
import toast from 'react-hot-toast';

export const OrderContext = createContext({});

export default function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const { authToken, seller } = useContext(UserContext);

  // Debounce tracking for status updates
  const statusUpdatePending = useRef(new Set());
  const STATUS_UPDATE_DEBOUNCE_MS = 2000;

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';

  // Fetch seller orders from CampoSocial API
  const fetchOrders = useCallback(async (page = 1, status = '') => {
    if (!authToken) return;

    setIsLoading(true);
    try {
      let url = `${apiEndpoint}/seller/orders?page=${page}&per_page=20`;
      if (status) url += `&status=${status}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.total_pages || 1,
        totalItems: data.pagination?.total_items || 0
      });

      if (data.orders?.length > 0 && !selectedOrder) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, apiEndpoint, selectedOrder]);

  // Update order status with idempotency
  const updateOrderStatus = useCallback(async (orderId, newStatus, options = {}) => {
    const { trackingNumber, shippingCarrier, notes } = options;

    // Debounce protection - prevent rapid clicks
    const updateKey = `${orderId}-${newStatus}`;
    if (statusUpdatePending.current.has(updateKey)) {
      toast.error('Please wait before updating again');
      return { success: false, error: 'Debounce active' };
    }

    // Add to pending set
    statusUpdatePending.current.add(updateKey);

    // Generate idempotency key
    const idempotencyKey = `${orderId}-${newStatus}-${Date.now()}`;

    try {
      const response = await fetch(`${apiEndpoint}/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber,
          shipping_carrier: shippingCarrier,
          notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, tracking_number: trackingNumber || order.tracking_number, shipping_carrier: shippingCarrier || order.shipping_carrier }
          : order
      ));

      // Update selected order if it's the one being modified
      setSelectedOrder(prev =>
        prev?.id === orderId
          ? { ...prev, status: newStatus, tracking_number: trackingNumber || prev.tracking_number, shipping_carrier: shippingCarrier || prev.shipping_carrier }
          : prev
      );

      toast.success(data.message || 'Order status updated');
      return { success: true, data };

    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update status');
      return { success: false, error: error.message };
    } finally {
      // Remove from pending after debounce period
      setTimeout(() => {
        statusUpdatePending.current.delete(updateKey);
      }, STATUS_UPDATE_DEBOUNCE_MS);
    }
  }, [authToken, apiEndpoint]);

  // Get order details
  const getOrderDetails = useCallback(async (orderId) => {
    if (!authToken) return null;

    try {
      const response = await fetch(`${apiEndpoint}/seller/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  }, [authToken, apiEndpoint]);

  // Filter orders by date range
  const filterOrders = useCallback((filter) => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
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

  // Search orders
  function searchOrders(query) {
    if (!query) {
      setFilteredOrders(orders);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filtered = orders.filter(order => {
      const firstName = order.customer?.first_name?.toLowerCase() || '';
      const lastName = order.customer?.last_name?.toLowerCase() || '';
      const email = order.customer?.email?.toLowerCase() || '';
      const ticketNumber = order.ticket_number?.toLowerCase() || '';
      const phone = order.customer?.phone?.toLowerCase() || '';

      return firstName.includes(lowerCaseQuery) ||
        lastName.includes(lowerCaseQuery) ||
        email.includes(lowerCaseQuery) ||
        ticketNumber.includes(lowerCaseQuery) ||
        phone.includes(lowerCaseQuery);
    });

    setFilteredOrders(filtered);
  }

  // Calculate earnings from paid orders
  const calculateEarningsFromPaidOrders = useCallback((orderList) => {
    return orderList.reduce((total, order) => {
      if (order.paid) {
        return total + (order.seller_total || 0);
      }
      return total;
    }, 0);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (authToken) {
      fetchOrders(1, statusFilter);
    }
  }, [authToken, statusFilter]);

  // Filter paid orders
  useEffect(() => {
    const filtered = Array.isArray(orders) ? orders.filter(order => order.paid) : [];
    setFilteredStatus(filtered);
  }, [orders]);

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
      filteredStatus,
      pagination,
      statusFilter,
      setStatusFilter,
      fetchOrders,
      updateOrderStatus,
      getOrderDetails
    }}>
      {children}
    </OrderContext.Provider>
  );
}
