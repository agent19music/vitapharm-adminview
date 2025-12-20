'use client'

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from './UserContext';
import * as React from "react"
import { toast } from 'react-hot-toast';

// Create the context
export const ProductContext = createContext({});

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Discount state
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  let today = new Date()
  const sevenDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

  const [date, setDate] = React.useState({
    from: today,
    to: sevenDaysFromToday,
  });

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';
  const { authToken } = useContext(UserContext);

  // ==================== PRODUCTS ====================

  // Fetch seller's products from CampoSocial API
  const fetchProducts = useCallback(async () => {
    if (!authToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}/seller/products`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, apiEndpoint]);

  // Fetch single product
  const fetchProduct = useCallback(async (productId) => {
    if (!authToken) return null;

    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }, [authToken, apiEndpoint]);

  // Initial fetch
  useEffect(() => {
    if (authToken) {
      fetchProducts();
    }
  }, [authToken]);

  // Search items
  // Weighted search algorithm
  function searchItems(query) {
    if (!query) {
      setFilteredProducts(products);
      return products;
    }

    const lowerCaseQuery = query.toLowerCase();
    const terms = lowerCaseQuery.split(' ').filter(t => t.length > 0);

    const scoredProducts = products.map(product => {
      let score = 0;
      const title = product.title?.toLowerCase() || '';
      const brand = product.brand?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';

      // Exact match bonus
      if (title === lowerCaseQuery) score += 100;
      if (brand === lowerCaseQuery) score += 80;

      // Term matching
      terms.forEach(term => {
        if (title.includes(term)) score += 30;
        if (title.startsWith(term)) score += 10; // Starts with bonus
        if (brand.includes(term)) score += 20;
        if (category.includes(term)) score += 15;
        if (description.includes(term)) score += 5;
      });

      return { product, score };
    });

    // Filter out zero scores and sort by score descending
    const filtered = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    setFilteredProducts(filtered);
    return filtered;
  }

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error deleting product');
      }

      // Remove from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      setFilteredProducts(prev => prev.filter(p => p.id !== productId));

      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Update product (legacy method for edit product page)
  const updateProduct = async (productId) => {
    setIsLoading(true);

    try {
      const payload = {
        images: selectedImages,
        category: selectedCategory,
        sub_category: selectedSubCategory,
        variations: variants,
        title: name,
        description: description,
      };

      const response = await fetch(`${apiEndpoint}/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update local state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...payload } : p));
      setFilteredProducts(prev => prev.map(p => p.id === productId ? { ...p, ...payload } : p));

      toast.success('Product updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('An error occurred while updating the product.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create new product (legacy method)
  const createProduct = async (productData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/seller/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create product`);
      }

      const data = await response.json();

      // Add to local state
      setProducts(prev => [...prev, data.product || data]);
      setFilteredProducts(prev => [...prev, data.product || data]);

      toast.success('Product created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update stock for product variants
  const updateStock = async (productId, variations) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ variations })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Refresh products to get updated stock
      await fetchProducts();

      toast.success('Stock updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      return false;
    }
  };

  // Toggle product active status
  const toggleProductActive = async (productId, isActive) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle product status');
      }

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_active: isActive } : p
      ));
      setFilteredProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, is_active: isActive } : p
      ));

      toast.success(`Product ${isActive ? 'activated' : 'deactivated'}`);
      return true;
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Failed to update product status');
      return false;
    }
  };

  // Update product status (draft, active, archived, sold_out)
  const updateProductStatus = async (productId, status) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update product status');
      }

      const data = await response.json();

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: data.status, is_active: data.is_active } : p
      ));
      setFilteredProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: data.status, is_active: data.is_active } : p
      ));

      toast.success(`Product status updated to "${status}"`);
      return true;
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
      return false;
    }
  };

  // ==================== DISCOUNTS ====================

  // Fetch seller's discounts
  const fetchDiscounts = useCallback(async () => {
    if (!authToken) return;

    setDiscountsLoading(true);
    try {
      const response = await fetch(`${apiEndpoint}/seller/discounts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      setDiscounts(data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setDiscountsLoading(false);
    }
  }, [authToken, apiEndpoint]);

  // Create discount
  const createDiscount = async (discountData) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/discounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discount');
      }

      const data = await response.json();

      // Refresh discounts list
      await fetchDiscounts();

      toast.success('Discount created successfully');
      return data;
    } catch (error) {
      console.error('Error creating discount:', error);
      toast.error(error.message || 'Failed to create discount');
      return null;
    }
  };

  // Update discount
  const updateDiscount = async (discountId, discountData) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/discounts/${discountId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(discountData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discount');
      }

      // Refresh discounts list
      await fetchDiscounts();

      toast.success('Discount updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error.message || 'Failed to update discount');
      return false;
    }
  };

  // Delete discount
  const deleteDiscount = async (discountId) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/discounts/${discountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount');
      }

      // Remove from local state
      setDiscounts(prev => prev.filter(d => d.id !== discountId));

      toast.success('Discount deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount');
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{
      // Products
      products,
      filteredProducts,
      isLoading,
      searchItems,
      setProducts,
      setFilteredProducts,
      setIsLoading,
      deleteProduct,
      apiEndpoint,
      fetchProducts,
      fetchProduct,
      updateProduct,
      createProduct,
      updateStock,
      toggleProductActive,
      updateProductStatus,

      // Form state (legacy)
      setDate,
      date,
      selectedImages,
      setSelectedImages,
      selectedCategory,
      selectedSubCategory,
      setSelectedSubCategory,
      setSelectedCategory,
      variants,
      setVariants,
      setName,
      name,
      setDescription,
      description,

      // Discounts
      discounts,
      discountsLoading,
      fetchDiscounts,
      createDiscount,
      updateDiscount,
      deleteDiscount
    }}>
      {children}
    </ProductContext.Provider>
  );
}
