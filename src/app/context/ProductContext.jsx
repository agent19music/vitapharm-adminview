'use client'

import { createContext, useState, useEffect } from 'react';

// Create the context
export const ProductContext = createContext({});

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    setIsLoading(true);
    fetch('http://server-env.eba-8hpawwgj.eu-north-1.elasticbeanstalk.com/api/vitapharm/products')
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

  return (
    <ProductContext.Provider value={{
      products,
      filteredProducts,
      isLoading,
      searchItems,
      setProducts,
      setFilteredProducts,
      setIsLoading
    }}>
      {children}
    </ProductContext.Provider>
  );
}
