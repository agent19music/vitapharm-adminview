"use client"

import * as React from "react"
import { useContext, useState } from "react"
import { toast } from "react-hot-toast"
import { Package } from "phosphor-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CategorySearch } from "@/components/ui/category-search"
import { ImageUploader } from "@/components/ui/image-uploader"
import { VariantEditor } from "@/components/ui/variant-editor"
import { ProductContext } from "@/context/ProductContext"
import { UserContext } from "@/context/UserContext"

export function AddProductModal({ open, onOpenChange, onSuccess }) {
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

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            price: "",
            brand: "",
            category: ""
        })
        setImages([])
        setVariants([])
        setImageVariantLinks({})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Product title is required")
            return
        }

        setIsLoading(true)

        try {
            // Build FormData for multipart upload
            const submitData = new FormData()
            submitData.append('title', formData.title)
            submitData.append('description', formData.description || '')
            submitData.append('price', formData.price || '0')
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

            const result = await response.json()

            toast.success("Product created successfully!")
            resetForm()
            onOpenChange(false)

            // Refresh products list
            if (fetchProducts) {
                fetchProducts()
            }

            if (onSuccess) {
                onSuccess(result.product)
            }

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Add New Product
                    </DialogTitle>
                    <DialogDescription>
                        Create a new product for your store. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Product Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter product name"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
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
                    </div>

                    {/* Category & Price */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <CategorySearch
                                value={formData.category}
                                onChange={(val) => setFormData({ ...formData, category: val })}
                                placeholder="Search category..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Base Price (KES)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your product..."
                            className="min-h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Product Images</Label>
                        <ImageUploader
                            images={images}
                            onImagesChange={setImages}
                            variants={variants}
                            onImageVariantLink={handleImageVariantLink}
                        />
                    </div>

                    {/* Variants */}
                    <div className="space-y-2">
                        <VariantEditor
                            variants={variants}
                            onChange={setVariants}
                            basePrice={parseFloat(formData.price) || 0}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm()
                                onOpenChange(false)
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Product"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
