'use client'

import { createContext, useState, useEffect, useContext } from 'react';
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
  const [variants, setVariants] = useState();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  let today = new Date()
  const sevenDaysFromToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);


  const [date, setDate] = React.useState({
    from: today,
    to: sevenDaysFromToday,
  });
  
  
  const apiEndpoint = 'https://www.vitapharmcosmetics.co.ke/api/vitapharm'
  // const apiEndpoint = 'http://vitapharm-server-env.eba-k5q68s3p.eu-north-1.elasticbeanstalk.com/api/vitapharm'

  const {authToken} =  useContext(UserContext)


  // Fetch products
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/products`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    })
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

const updateProduct = async (productId) => {
  setIsLoading(true);

  try {
    const payload = {
      productId: productId,
      images: selectedImages,
      category: selectedCategory,
      sub_category: selectedSubCategory,
      variations: variants,
      name: name,
      description: description,
    };

    // Log the payload data
    console.log(payload);

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
    console.log(data);
    toast.success('Product updated successfully!');
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('An error occurred while updating the product.');
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
      updateProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
}
