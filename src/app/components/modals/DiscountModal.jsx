"use client"

import * as React from "react"
import { useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Percent, Tag, Calendar, Package, Check } from "phosphor-react"
import { format } from "date-fns"

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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserContext } from "@/context/UserContext"
import { ProductContext } from "@/context/ProductContext"

export function DiscountModal({ open, onOpenChange, discount, onSuccess }) {
    const { authToken } = useContext(UserContext)
    const { products, fetchProducts } = useContext(ProductContext)

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api'

    const isEditing = !!discount?.id

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage",
        value: "",
        min_order_amount: "",
        max_discount_amount: "",
        max_uses: "",
        starts_at: "",
        expires_at: "",
        is_active: true
    })
    const [selectedProducts, setSelectedProducts] = useState([])

    // Populate form when editing
    useEffect(() => {
        if (discount) {
            setFormData({
                code: discount.code || "",
                discount_type: discount.discount_type || "percentage",
                value: discount.value?.toString() || "",
                min_order_amount: discount.min_order_amount?.toString() || "",
                max_discount_amount: discount.max_discount_amount?.toString() || "",
                max_uses: discount.max_uses?.toString() || "",
                starts_at: discount.starts_at ? format(new Date(discount.starts_at), "yyyy-MM-dd'T'HH:mm") : "",
                expires_at: discount.expires_at ? format(new Date(discount.expires_at), "yyyy-MM-dd'T'HH:mm") : "",
                is_active: discount.is_active ?? true
            })
            setSelectedProducts(discount.product_ids || [])
        } else {
            // Reset form for new discount
            setFormData({
                code: "",
                discount_type: "percentage",
                value: "",
                min_order_amount: "",
                max_discount_amount: "",
                max_uses: "",
                starts_at: "",
                expires_at: "",
                is_active: true
            })
            setSelectedProducts([])
        }
    }, [discount])

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.code.trim()) {
            toast.error("Discount code is required")
            return
        }

        if (!formData.value || parseFloat(formData.value) <= 0) {
            toast.error("Discount value is required")
            return
        }

        setIsLoading(true)

        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                discount_type: formData.discount_type,
                value: parseFloat(formData.value),
                min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                starts_at: formData.starts_at || null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active,
                product_ids: selectedProducts.length > 0 ? selectedProducts : null
            }

            const url = isEditing
                ? `${apiEndpoint}/seller/discounts/${discount.id}`
                : `${apiEndpoint}/seller/discounts`

            const response = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || `Failed to ${isEditing ? 'update' : 'create'} discount`)
            }

            toast.success(`Discount ${isEditing ? 'updated' : 'created'} successfully!`)
            onOpenChange(false)

            if (onSuccess) {
                onSuccess()
            }

        } catch (error) {
            console.error('Error saving discount:', error)
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} discount`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        {isEditing ? "Edit Discount" : "Create Discount"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update discount code settings" : "Create a new discount code for your products"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Code and Type */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="code">Discount Code *</Label>
                            <Input
                                id="code"
                                placeholder="e.g. SAVE20"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="uppercase"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select
                                value={formData.discount_type}
                                onValueChange={(val) => setFormData({ ...formData, discount_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (KES)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Value and Limits */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="value">
                                {formData.discount_type === "percentage" ? "Percentage *" : "Amount (KES) *"}
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                max={formData.discount_type === "percentage" ? "100" : undefined}
                                step="0.01"
                                placeholder={formData.discount_type === "percentage" ? "e.g. 20" : "e.g. 500"}
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="min_order">Min Order (KES)</Label>
                            <Input
                                id="min_order"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        {formData.discount_type === "percentage" && (
                            <div className="space-y-2">
                                <Label htmlFor="max_discount">Max Discount (KES)</Label>
                                <Input
                                    id="max_discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="No limit"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Validity Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at" className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Starts At
                            </Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={formData.starts_at}
                                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expires_at" className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Expires At
                            </Label>
                            <Input
                                id="expires_at"
                                type="datetime-local"
                                value={formData.expires_at}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Usage and Status */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="max_uses">Max Uses (Total)</Label>
                            <Input
                                id="max_uses"
                                type="number"
                                min="1"
                                step="1"
                                placeholder="Unlimited"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>
                    </div>

                    {/* Product Selection */}
                    {products && products.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="flex items-center gap-1">
                                        <Package className="h-3.5 w-3.5" />
                                        Apply to Products
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Select products or leave empty to apply to all
                                    </p>
                                </div>
                                {selectedProducts.length > 0 && (
                                    <Badge variant="secondary">
                                        {selectedProducts.length} selected
                                    </Badge>
                                )}
                            </div>

                            <div className="grid gap-2 max-h-40 overflow-y-auto p-1">
                                {products.slice(0, 20).map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => toggleProductSelection(product.id)}
                                        className={`flex items-center justify-between p-2 rounded border text-left transition-colors ${selectedProducts.includes(product.id)
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm truncate max-w-xs">{product.title}</span>
                                        </div>
                                        {selectedProducts.includes(product.id) && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                            {isLoading ? "Saving..." : isEditing ? "Update Discount" : "Create Discount"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
