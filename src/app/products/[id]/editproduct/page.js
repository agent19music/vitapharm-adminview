"use client"

import { useState, useEffect, useContext } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast, Toaster } from "react-hot-toast"
import {
  CaretLeft,
  FloppyDisk,
  Package
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import SideNav from "@/app/components/SideNav"
import { ThemeToggle } from "@/app/components/ThemeToggle"
import PhotoCard from "@/app/components/editproduct/PhotoCard"
import VariantHandle from "@/app/components/editproduct/VariantHandle"
import { CategorySearch } from "@/components/ui/category-search"

import withAuth from "@/hoc/WithAuth"
import { UserContext } from "@/context/UserContext"
import { ProductContext } from "@/context/ProductContext"

function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id

  const { authToken, apiEndpoint } = useContext(UserContext)
  const {
    variants,
    setVariants,
    selectedImages,
    setSelectedImages,
    fetchProducts
  } = useContext(ProductContext)

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [deletedImageIds, setDeletedImageIds] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    category: "",
    status: "active"
  })

  // Fetch product data
  useEffect(() => {
    if (!productId || !apiEndpoint) return

    setIsLoading(true)
    fetch(`${apiEndpoint}/seller/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error('Product not found')
        return response.json()
      })
      .then(data => {
        setProduct(data)
        setFormData({
          title: data.title || data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          brand: data.brand || "",
          category: data.category || "",
          status: data.status || "active"
        })
        // Clear any previously selected new images
        setSelectedImages([])
      })
      .catch(error => {
        console.error('Error fetching product:', error)
        toast.error('Failed to load product')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [productId, apiEndpoint, authToken, setSelectedImages])

  // Check if variants have prices
  const variantsHavePrices = variants?.length > 0 && variants.every(v => v.price && parseFloat(v.price) > 0)
  const isPriceRequired = !variants?.length || !variantsHavePrices

  const handleDeleteImage = (imageId) => {
    setDeletedImageIds(prev => [...prev, imageId])
    // Update local product state to remove the image from view
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }))
  }

  const handleSave = async () => {
    // ... validation ...

    setIsSaving(true)

    try {
      // Build FormData for multipart upload
      const submitData = new FormData()
      // ... existing fields ...
      submitData.append('title', formData.title)
      submitData.append('description', formData.description || '')

      if (isPriceRequired || formData.price) {
        submitData.append('price', formData.price || '0')
      }

      submitData.append('brand', formData.brand || '')
      submitData.append('category', formData.category || '')

      // Add variations as JSON string
      if (variants?.length > 0) {
        submitData.append('variations', JSON.stringify(variants.map(v => ({
          id: v.id || null,
          name: v.name,
          value: v.value,
          price: v.price,
          stock: v.stock
        }))))
      }

      // Add deleted images
      if (deletedImageIds.length > 0) {
        submitData.append('remove_images', JSON.stringify(deletedImageIds))
      }

      // Add new images (File objects from selectedImages)
      if (selectedImages?.length > 0) {
        selectedImages.forEach((image) => {
          if (image instanceof File) {
            submitData.append('images', image)
          }
        })
      }

      const response = await fetch(`${apiEndpoint}/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: submitData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }

      toast.success("Product updated successfully!")

      // Refresh products list
      if (fetchProducts) {
        fetchProducts()
      }

      // Navigate back to products
      setTimeout(() => {
        router.push('/products')
      }, 1000)

    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error.message || "Failed to update product")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${apiEndpoint}/seller/products/${productId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')

      setFormData(prev => ({ ...prev, status: newStatus }))
      toast.success(`Status changed to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SideNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="flex-1 p-4 sm:px-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="h-8 w-48 animate-pulse bg-muted rounded" />
              <div className="h-96 animate-pulse bg-muted rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SideNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="flex-1 p-4 sm:px-6">
            <div className="mx-auto max-w-4xl text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Product not found</h2>
              <Button asChild>
                <Link href="/products">Back to Products</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
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
                <BreadcrumbPage>Edit Product</BreadcrumbPage>
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
                {formData.title || "Edit Product"}
              </h1>
              <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                {formData.status}
              </Badge>
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Discard</Link>
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <FloppyDisk className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>

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
                      <Label htmlFor="title">Product Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter product name"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product..."
                        className="min-h-32"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Variants Card */}
                <VariantHandle product={product} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sold_out">Sold Out</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Pricing Card */}
                {isPriceRequired ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing</CardTitle>
                      <CardDescription>Base price for your product</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="price">Base Price (KES) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter price"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {variants?.length > 0
                            ? "Add prices to all variants to use variant pricing"
                            : "This is the selling price"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-500/50 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-400">Variant Pricing</CardTitle>
                      <CardDescription>
                        Using prices from variants
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {/* Category & Brand */}
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <CategorySearch
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        placeholder="Brand name"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <PhotoCard product={product} onDeleteImage={handleDeleteImage} />
              </div>
            </div>

            {/* Mobile Save Button */}
            <div className="flex items-center justify-center gap-2 md:hidden mt-6">
              <Button variant="outline" size="sm" asChild>
                <Link href="/products">Discard</Link>
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <FloppyDisk className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default withAuth(EditProduct)