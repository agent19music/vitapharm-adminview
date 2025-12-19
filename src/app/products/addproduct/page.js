"use client"

import { useContext, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast, Toaster } from "react-hot-toast"
import {
  CaretLeft,
  Package,
  FloppyDisk,
  House
} from "phosphor-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import SideNav from "@/app/components/SideNav"
import { ThemeToggle } from "@/app/components/ThemeToggle"
import { CategorySearch } from "@/components/ui/category-search"
import { ImageUploader } from "@/components/ui/image-uploader"
import { VariantEditor } from "@/components/ui/variant-editor"

import withAuth from "@/hoc/WithAuth"
import { UserContext } from "@/context/UserContext"
import { ProductContext } from "@/context/ProductContext"

function AddProduct() {
  const router = useRouter()
  const { authToken } = useContext(UserContext)
  const { fetchProducts } = useContext(ProductContext)

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api'

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    category: ""
  })
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])
  const [imageVariantLinks, setImageVariantLinks] = useState({})

  // Validation state for showing inline errors
  const [errors, setErrors] = useState({})

  // Check if variants have prices defined
  const variantsHavePrices = variants.length > 0 && variants.every(v => v.price && parseFloat(v.price) > 0)

  // Price is required only if no variants OR variants don't have prices
  const isPriceRequired = variants.length === 0 || !variantsHavePrices

  const validateForm = () => {
    const newErrors = {}

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = "Product title is required"
    }

    // Price is required only if no variants with prices
    if (isPriceRequired) {
      const price = parseFloat(formData.price)
      if (!formData.price || isNaN(price) || price <= 0) {
        newErrors.price = "Valid price is required (must be greater than 0)"
      }
    }

    // At least one image is required
    if (images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Run validation
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      // Show toast for the first error
      if (validationErrors.title) toast.error(validationErrors.title)
      else if (validationErrors.price) toast.error(validationErrors.price)
      else if (validationErrors.images) toast.error(validationErrors.images)
      return
    }

    setIsLoading(true)

    try {
      // Build FormData for multipart upload
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description || '')

      // Only include price if required (no variants with prices)
      if (isPriceRequired || formData.price) {
        submitData.append('price', formData.price || '0')
      }

      submitData.append('brand', formData.brand || '')
      submitData.append('category', formData.category || '')

      // Add variations as JSON string
      if (variants.length > 0) {
        submitData.append('variations', JSON.stringify(variants.map(v => ({
          name: v.name,
          value: v.value,
          price: v.price,
          stock: v.stock
        }))))
      }

      // Add images
      images.forEach((image) => {
        if (image instanceof File) {
          submitData.append('images', image)
        }
      })

      const response = await fetch(`${apiEndpoint}/seller/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: submitData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create product')
      }

      toast.success("Product created successfully!")

      // Refresh products list
      if (fetchProducts) {
        fetchProducts()
      }

      // Navigate to products list
      setTimeout(() => {
        router.push('/products')
      }, 1000)

    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageVariantLink = (imageIndex, variantId) => {
    setImageVariantLinks(prev => ({
      ...prev,
      [imageIndex]: variantId
    }))
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideNav />
      <Toaster />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
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
                <BreadcrumbPage>Add Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8">
          <div className="mx-auto w-full max-w-4xl">
            {/* Page Title */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                <Link href="/products">
                  <CaretLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <h1 className="flex-1 text-xl font-semibold tracking-tight">
                Add New Product
              </h1>
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Discard</Link>
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
                  <FloppyDisk className="h-4 w-4 mr-1" />
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Details</CardTitle>
                      <CardDescription>
                        Basic information about your product
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className={errors.title ? 'text-red-500' : ''}>Product Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter product name"
                          value={formData.title}
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value })
                            if (errors.title) setErrors(prev => ({ ...prev, title: null }))
                          }}
                          className={errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          required
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your product in detail..."
                          className="min-h-32"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Images Card */}
                  <Card className={errors.images ? 'border-red-500' : ''}>
                    <CardHeader>
                      <CardTitle className={errors.images ? 'text-red-500' : ''}>Product Images *</CardTitle>
                      <CardDescription>
                        Upload up to 10 images. At least one image is required.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImageUploader
                        images={images}
                        onImagesChange={(newImages) => {
                          setImages(newImages)
                          if (errors.images && newImages.length > 0) {
                            setErrors(prev => ({ ...prev, images: null }))
                          }
                        }}
                        variants={variants}
                        onImageVariantLink={handleImageVariantLink}
                      />
                      {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images}</p>}
                    </CardContent>
                  </Card>

                  {/* Variants Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Variants</CardTitle>
                      <CardDescription>
                        Add size, color, or other variations with different prices and stock levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VariantEditor
                        variants={variants}
                        onChange={setVariants}
                        basePrice={parseFloat(formData.price) || 0}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Meta Info */}
                <div className="space-y-6">
                  {/* Category & Brand Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization</CardTitle>
                      <CardDescription>
                        Categorize your product
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <CategorySearch
                          value={formData.category}
                          onChange={(val) => setFormData({ ...formData, category: val })}
                          placeholder="Search category..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          placeholder="Enter brand name"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing Card - Only show if price is required */}
                  {isPriceRequired ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>
                          Set base price for your product
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className={errors.price ? 'text-red-500' : ''}>Base Price (KES) *</Label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter price"
                            value={formData.price}
                            onChange={(e) => {
                              setFormData({ ...formData, price: e.target.value })
                              if (errors.price) setErrors(prev => ({ ...prev, price: null }))
                            }}
                            className={errors.price ? 'border-red-500 focus-visible:ring-red-500' : ''}
                          />
                          {errors.price ? (
                            <p className="text-xs text-red-500">{errors.price}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {variants.length > 0
                                ? "Set variant prices to hide this field"
                                : "This is the selling price for your product"}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-green-500/50 bg-green-500/5">
                      <CardHeader>
                        <CardTitle className="text-green-700 dark:text-green-400">Pricing via Variants</CardTitle>
                        <CardDescription>
                          All your variants have prices set. The product will use variant-based pricing.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}

                  {/* Quick Tips Card */}
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Quick Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                      <p>• Use clear, descriptive titles</p>
                      <p>• Add multiple images showing different angles</p>
                      <p>• Include size guides in descriptions</p>
                      <p>• Set accurate stock levels</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile Save Button */}
              <div className="flex items-center justify-center gap-2 md:hidden mt-6">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Discard</Link>
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  <FloppyDisk className="h-4 w-4 mr-1" />
                  {isLoading ? "Saving..." : "Save Product"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

export default withAuth(AddProduct)