"use client";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea from your UI library
import { Button } from "@/components/ui/button";
import Link from "next/link"
import {
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { useState } from "react"; // Import useState
import {
  TooltipProvider,  
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  CaretLeft,
  ChartLine,
  Gear,
  House,
  MagnifyingGlass,
  Package,
  PlusCircle,
  ShoppingCart,
  SidebarSimple,
  UploadSimple,
  UsersThree,
  X,
} from "phosphor-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import SideNav from "@/app/components/SideNav";
import withAuth from "@/hoc/WithAuth";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];



const formSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    subCategory: z.string(),
    brand: z.string(),
    variations: z.array(z.object({
      size: z.string(),
      price: z.number(),
    })),
    images: z
      .array(z.instanceof(File))
      .refine(
        (files) =>
          files.every(
            (file) =>
              file.size <= MAX_FILE_SIZE &&
              ACCEPTED_IMAGE_TYPES.includes(file.type)
          ),
        {
          message:
            "Item photo: Only .jpeg, .jpg, .png files of 2MB or less are accepted",
        }
      ),
  });



function AddProduct() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subCategory: "",
      brand: "",
      variations: [],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variations",
  });

  const [selectedImages, setSelectedImages] = useState([]); // State to manage selected images

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    form.setValue("images", files); // Update form value for images
  };
  
  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    form.setValue("images", newImages); // Update form value for images
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('admin_id', 1);
    
    // Create a copy of values and change subCategory to sub_category
    const adjustedValues = { ...values, sub_category: values.subCategory };
    delete adjustedValues.subCategory;
  
    Object.keys(adjustedValues).forEach((key) => {
      if (key === 'images') {
        selectedImages.forEach((file) => {
          formData.append(key, file);
        });
      } else {
        formData.append(key, JSON.stringify(adjustedValues[key]));
      }
    });
  
    // Log form data
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
  
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    
    if (!apiEndpoint) {
      console.error('API endpoint not configured');
      return;
    }
  
    // Call your API endpoint
    const response = await fetch(`${apiEndpoint}/api/vitapharm/products`, {
      method: 'POST',
      body: formData,
    });
  
    if (response.ok) {
      console.log('Product added successfully');
    } else {
      console.error('Failed to add product');
    }
  };
  

   

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
     <SideNav/>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <SidebarSimple className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Package className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <House className="h-5 w-5" />
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
                  <UsersThree className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <ChartLine className="h-5 w-5" />
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
                <BreadcrumbPage>Add Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            /> */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
           
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        </div>
       
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-w-md w-full flex flex-col gap-4"
        >
          <div className="flex flex-wrap -mx-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full md:w-1/2 px-3">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-wrap -mx-3">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="face">Face</SelectItem>
                        <SelectItem value="eyes">Eyes</SelectItem>
                        <SelectItem value="body">Body</SelectItem>
                        <SelectItem value="skin">Skin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full md:w-1/2 px-3">
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-category</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lipstick">Lipstick</SelectItem>
                        <SelectItem value="moisturizer">Moisturizer</SelectItem>
                        <SelectItem value="cream">Cream</SelectItem>
                        <SelectItem value="eyeliner">Eyeliner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.map((item, index) => (
            <div key={item.id}>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <FormField
                    control={form.control}
                    name={`variations.${index}.size`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <FormControl>
                          <Input placeholder="Size" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                <FormField
                    control={form.control}
                    name={`variations.${index}.price`}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                            <Input 
                            placeholder="Price" 
                            {...field} 
                            onChange={e => {
                                field.onChange(parseFloat(e.target.value));
                            }}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                </div>
              </div>
              <button type="button" onClick={() => remove(index)}>
                Remove Variation
              </button>
            </div>
          ))}
             <button type="button" onClick={() => append({ size: "", price: "" })}>
            Add Variation
          </button>
           <div>
                <h3 className="text-lg font-medium">Images</h3>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  multiple
                  onChange={handleImageChange}
                />
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium">Selected Images</h4>
                    <ul className="list-disc list-inside">
                      {selectedImages && selectedImages.map((file, index) => (
                       <div  key={index} className="relative">
                       <button onClick={() => removeImage(index)} className="absolute top-0 right-0 p-1 bg-white text-red-500">
            <X className="h-4 w-4" />
          </button>
          
                        <Image
                          alt={`Selected image ${index + 1}`}
                          className="aspect-square w-full rounded-md object-cover"
                          height="720"
                          src={file}
                          width="480"
                        />
                      </div>
                      ))}
                    </ul>
                  </div>
                )}
                <FormMessage />
              </div>

       
         
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </main>
    </div>
  );
}

export default withAuth(AddProduct)