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
  let today = new Date()
  const sevenDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

  const [date, setDate] = React.useState({
    from: today,
    to: sevenDaysFromToday,
  });

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api';
  const { authToken } = useContext(UserContext);

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

  // Initial fetch
  useEffect(() => {
    if (authToken) {
      fetchProducts();
    }
  }, [authToken]);

  // Search items
  function searchItems(query) {
    if (!query) {
      setFilteredProducts(products);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filtered = products.filter(product => {
      const title = product.title?.toLowerCase() || '';
      const desc = product.description?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const brand = product.brand?.toLowerCase() || '';

      return title.includes(lowerCaseQuery) ||
        desc.includes(lowerCaseQuery) ||
        category.includes(lowerCaseQuery) ||
        brand.includes(lowerCaseQuery);
    });

    setFilteredProducts(filtered);
  }

  // Delete product
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${apiEndpoint}/products/${productId}`, {
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

  // Update product
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

      const response = await fetch(`${apiEndpoint}/products/${productId}`, {
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

  // Create new product
  const createProduct = async (productData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/products`, {
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

  return (
    <ProductContext.Provider value={{
      products,
      filteredProducts,
      isLoading,
      searchItems,
      setProducts,
      setFilteredProducts,
      setIsLoading,
      deleteProduct,
      apiEndpoint,
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
      updateProduct,
      createProduct,
      fetchProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
}
