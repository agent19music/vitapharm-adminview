'use client'

import { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

// Create the context
export const ProductContext = createContext({});

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiEndpoint = 'http://127.0.0.1:5000/api/vitapharm'
  const {authToken} =  useContext(UserContext)

  // Fetch products
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data); 
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setIsLoading(false);
      });
  }, []);

  // Search items
  function searchItems(query) {
    let lowerCaseQuery = query.toLowerCase();

    let filtered = products.filter(product => {
      let name = product.name.toLowerCase();
      let description = product.description.toLowerCase();
      let category = product.category.toLowerCase();
      let subCategory = product.sub_category.toLowerCase();

      return name.includes(lowerCaseQuery) || description.includes(lowerCaseQuery) || category.includes(lowerCaseQuery) || subCategory.includes(lowerCaseQuery);
    });

    setFilteredProducts(filtered);
  }

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
        const data = await response.json();
        console.log('Product deleted successfully:', data);
    } catch (error) {
        console.error('Error deleting product:', error);
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
      deleteProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
}
