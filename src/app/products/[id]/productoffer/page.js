'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useContext } from 'react';
import { isAfter, isBefore } from 'date-fns';
import SideNav from '@/app/components/SideNav';
import { ProductContext } from '@/app/context/ProductContext';
import { UserContext } from '@/app/context/UserContext';
import { DatePickerWithRange } from '@/app/components/Productoffer/DateRange';
import { toast, Toaster } from 'react-hot-toast';
import AdminPfp from '@/app/components/AdminPfp';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react"
import withAuth from '@/hoc/WithAuth';

function ProductOffer({ params }) {
  const { apiEndpoint, date } = useContext(ProductContext);
    const { authToken } = useContext(UserContext);
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await  fetch(`${apiEndpoint}/products/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    });
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
  } = useForm();



  useEffect(() => {
    if (date) {
      setValue('offerStartDate', date.from);
      setValue('offerEndDate', date.to);
    }
  }, [date, setValue]);

  console.log(date);
  

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data) => {
    if (data.offerPrice >= currentPrice) {
      toast.error('Offer price must be lower than the current price', {
        style: {
          background: '#713200',
          color: '#fff',
        },
      });
      return;
    }

    const payload = {
      deal_price: data.offerPrice,
      deal_start_time: formatDate(data.offerStartDate),
      deal_end_time: formatDate(data.offerEndDate),
    };
  
    // Log the data
    console.log(payload);
  
    try {
      const response = await fetch(`${apiEndpoint}/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit offer');
      }
  
      toast.success('Offer submitted successfully!', {
        style: {
          background: '#4ade80',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit offer', {
        style: {
          background: '#f87171',
          color: '#fff',
        },
      });
    }
  };
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideNav />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-foreground"
                >
                  <Package className="h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Put on Offer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
           
          </div>
         <AdminPfp/>
        </header>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Product Offer
          </h1>
        </header>
        <Toaster/>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 mt-12">
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
export default withAuth(ProductOffer)