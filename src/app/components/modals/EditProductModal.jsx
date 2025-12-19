"use client"

import * as React from "react"
import { useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { PencilSimple } from "phosphor-react"

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

export function EditProductModal({ open, onOpenChange, product, onSuccess }) {
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
    const [removedImageIds, setRemovedImageIds] = useState([])
    const [removedVariantIds, setRemovedVariantIds] = useState([])

    // Populate form when product changes
    useEffect(() => {
        if (product) {
            setFormData({
                title: product.title || "",
                description: product.description || "",
                price: product.price?.toString() || "",
                brand: product.brand || "",
                category: product.category || ""
            })

            // Set existing images
            setImages(product.images?.map(img => ({
                id: img.id,
                url: img.url || img.image_url,
                isExisting: true
            })) || [])

            // Set existing variants
            setVariants(product.variations?.map(v => ({
                id: v.id,
                name: v.name || v.variation_name,
                value: v.value || v.variation_value,
                price: v.price,
                stock: v.stock
            })) || [])

            setRemovedImageIds([])
            setRemovedVariantIds([])
        }
    }, [product])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("Product title is required")
            return
        }

        if (!product?.id) {
            toast.error("No product selected")
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

            // Add variations (including updates to existing ones)
            if (variants.length > 0) {
                submitData.append('variations', JSON.stringify(variants.map(v => ({
                    id: v.id || null,
                    name: v.name,
                    value: v.value,
                    price: v.price,
                    stock: v.stock
                }))))
            }

            // Add removed items
            if (removedVariantIds.length > 0) {
                submitData.append('remove_variations', JSON.stringify(removedVariantIds))
            }
            if (removedImageIds.length > 0) {
                submitData.append('remove_images', JSON.stringify(removedImageIds))
            }

            // Add new images (only File objects)
            images.forEach((image) => {
                if (image instanceof File) {
                    submitData.append('images', image)
                }
            })

            const response = await fetch(`${apiEndpoint}/seller/products/${product.id}`, {
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
            onOpenChange(false)

            // Refresh products list
            if (fetchProducts) {
                fetchProducts()
            }

            if (onSuccess) {
                onSuccess()
            }

        } catch (error) {
            console.error('Error updating product:', error)
            toast.error(error.message || "Failed to update product")
        } finally {
            setIsLoading(false)
        }
    }

    // Handle image changes - track removed existing images
    const handleImagesChange = (newImages) => {
        // Find removed existing images
        const currentExistingIds = newImages.filter(img => img.isExisting).map(img => img.id)
        const originalExistingIds = images.filter(img => img.isExisting).map(img => img.id)

        const newlyRemoved = originalExistingIds.filter(id => !currentExistingIds.includes(id))
        setRemovedImageIds(prev => [...new Set([...prev, ...newlyRemoved])])

        setImages(newImages)
    }

    // Handle variant removal - track for backend
    const handleVariantsChange = (newVariants) => {
        // Find removed existing variants
        const currentIds = newVariants.filter(v => v.id).map(v => v.id)
        const originalIds = variants.filter(v => v.id).map(v => v.id)

        const newlyRemoved = originalIds.filter(id => !currentIds.includes(id))
        setRemovedVariantIds(prev => [...new Set([...prev, ...newlyRemoved])])

        setVariants(newVariants)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PencilSimple className="h-5 w-5" />
                        Edit Product
                    </DialogTitle>
                    <DialogDescription>
                        Update your product details below.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Product Title *</Label>
                            <Input
                                id="edit-title"
                                placeholder="Enter product name"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand">Brand</Label>
                            <Input
                                id="edit-brand"
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
                            <Label htmlFor="edit-price">Base Price (KES)</Label>
                            <Input
                                id="edit-price"
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
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
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
                            onImagesChange={handleImagesChange}
                            variants={variants}
                        />
                    </div>

                    {/* Variants */}
                    <div className="space-y-2">
                        <VariantEditor
                            variants={variants}
                            onChange={handleVariantsChange}
                            basePrice={parseFloat(formData.price) || 0}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
