'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { parseISO, isBefore } from 'date-fns';
import SideNav from '@/app/components/SideNav';

// Define the validation schema using Zod
const schema = z.object({
  offerPrice: z.number().min(0, 'Offer price must be a positive number'),
  offerStartDate: z.date().refine((date) => !isBefore(date, new Date()), 'Start date cannot be in the past'),
  offerEndDate: z.date().refine((date) => !isBefore(date, new Date()), 'End date cannot be in the past'),
});

export default function ProductOffer({ params }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState({
    offerPrice: 0,
    offerStartDate: new Date(),
    offerEndDate: new Date(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://server-env.eba-8hpawwgj.eu-north-1.elasticbeanstalk.com/api/vitapharm/products/${params.id}`);
        const data = await response.json();
        setProduct(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [params]);

  useEffect(() => {
    if (product) {
      setDefaultValues({
        offerPrice: product.offer_price || 0,
        offerStartDate: product.offer_startdate ? parseISO(product.offer_startdate) : new Date(),
        offerEndDate: product.offer_enddate ? parseISO(product.offer_enddate) : new Date(),
      });
    }
  }, [product]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data) => {
    console.log(data);
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
          <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <div className="grid gap-3">
                  <label htmlFor="offerPrice">Offer Price</label>
                  <input
                    id="offerPrice"
                    type="number"
                    {...register('offerPrice')}
                    placeholder="Offer Price"
                    className="w-full p-2 border rounded"
                  />
                  {errors.offerPrice && <span>{errors.offerPrice.message}</span>}
                </div>
                <div className="grid gap-3">
                  <label htmlFor="offerStartDate">Offer Start Date</label>
                  <Calendar 
                    selected={defaultValues.offerStartDate} 
                    onChange={(date) => setValue('offerStartDate', date)} 
                  />
                  {errors.offerStartDate && <span>{errors.offerStartDate.message}</span>}
                </div>
                <div className="grid gap-3">
                  <label htmlFor="offerEndDate">Offer End Date</label>
                  <Calendar 
                    selected={defaultValues.offerEndDate} 
                    onChange={(date) => setValue('offerEndDate', date)} 
                  />
                  {errors.offerEndDate && <span>{errors.offerEndDate.message}</span>}
                </div>
                <Button type="submit" className="mt-4">Submit</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
