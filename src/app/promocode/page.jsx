'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { DatePickerWithRange } from '@/app/components/Productoffer/DateRange';
import { toast, Toaster } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SideNav from '../components/SideNav';
import { ProductContext } from '@/app/context/ProductContext';
import {usePathname} from 'next/navigation'

const PromoCodeForm = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { apiEndpoint, date, setDate } = useContext(ProductContext);
  const currentPath = usePathname()

  useEffect(() => {
    if (date) {
      setValue('startDate', date.from);
      setValue('endDate', date.to);
    }
  }, [date, setValue]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data) => {
    const payload = {
      code: data.promoCode,
      discount_percentage: data.discount,
      expiration_date: formatDate(data.endDate),
    };

    // Log the data
    console.log(payload);

    try {
      const response = await fetch(`${apiEndpoint}/discount/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add promo code');
      }

      toast.success('Promo code added successfully!', {
        style: {
          background: '#4ade80',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add promo code', {
        style: {
          background: '#f87171',
          color: '#fff',
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideNav  />
      <div className="flex flex-col items-center justify-center w-full p-6">
        <Toaster />
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-4">Add Promo Code</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-md shadow-sm">
            <div>
              <Label htmlFor="promoCode" className="block text-sm font-medium text-gray-700">
                Promo Code
              </Label>
              <Input
                id="promoCode"
                type="text"
                {...register('promoCode', { required: 'Promo code is required' })}
                className="mt-1 block w-full"
              />
              {errors.promoCode && <span className="text-red-500">{errors.promoCode.message}</span>}
            </div>
            <div>
              <Label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                Discount Percentage
              </Label>
              <Input
                id="discount"
                type="number"
                {...register('discount', { required: 'Discount is required', valueAsNumber: true })}
                className="mt-1 block w-full"
              />
              {errors.discount && <span className="text-red-500">{errors.discount.message}</span>}
            </div>
            <div>
              <Label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                Validity Period
              </Label>
              <DatePickerWithRange />
              <input type="hidden" {...register('startDate')} />
              <input type="hidden" {...register('endDate')} />
            </div>
            <Button type="submit" className="w-full">
              Add Promo Code
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeForm;
