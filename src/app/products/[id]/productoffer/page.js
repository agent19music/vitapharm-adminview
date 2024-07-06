'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useContext } from 'react';
import { isAfter } from 'date-fns';
import { z } from 'zod';
import SideNav from '@/app/components/SideNav';
import { ProductContext } from '@/app/context/ProductContext';
import { DatePickerWithRange } from '@/app/components/Productoffer/DateRange';
const offerSchema = z.object({
  offerPrice: z.number().positive({ message: 'Price must be positive' }),
  offerStartDate: z.date().refine((date) => !isAfter(date, new Date()), { message: 'Start date cannot be in the future' }),
  offerEndDate: z.date().refine((date) => !isAfter(date, new Date()), { message: 'End date cannot be in the future' }),
});

export default function ProductOffer({ params }) {
  const { apiEndpoint } = useContext(ProductContext);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiEndpoint}/products/${params.id}`);
        const data = await response.json();
        setProduct(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, apiEndpoint]);

  const currentPrice = product?.variations[0]?.price || 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(offerSchema),
  });

  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  useEffect(() => {
    if (dateRange) {
      setValue('offerStartDate', dateRange.from);
      setValue('offerEndDate', dateRange.to);
    }
  }, [dateRange, setValue]);

  const onSubmit = async (data) => {
    if (data.offerPrice >= currentPrice) {
      alert('Offer price must be lower than the current price');
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.id,
          offerPrice: data.offerPrice,
          offerStartDate: data.offerStartDate,
          offerEndDate: data.offerEndDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit offer');
      }

      alert('Offer submitted successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit offer');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideNav />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Product Offer
          </h1>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
              <h2 className="text-2xl font-bold">{product?.name}</h2>
              <p>Current Price: Ksh {currentPrice}</p>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                  <div className="grid gap-3">
                    <label htmlFor="offerPrice">Offer Price</label>
                    <input
                  id="offerPrice"
                  type="number"
                  {...register('offerPrice', { valueAsNumber: true })}
                  placeholder="Offer Price"
                  className="w-full p-2 border rounded"
                />

                    {errors.offerPrice && <span className="text-red-500">{errors.offerPrice.message}</span>}
                  </div>
                  <DatePickerWithRange
                    className="grid gap-3 md:grid-cols-2"
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                  <Button type="submit" className="mt-4">Submit</Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
