"use client"

import * as React from "react"
import { useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Cube, Package } from "phosphor-react"

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
import { UserContext } from "@/context/UserContext"
import { ProductContext } from "@/context/ProductContext"

export function StockModal({ open, onOpenChange, product, onSuccess }) {
    const { authToken } = useContext(UserContext)
    const { fetchProducts } = useContext(ProductContext)

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:5001/camposocial/api'

    const [isLoading, setIsLoading] = useState(false)
    const [stockData, setStockData] = useState([])

    // Populate stock data when product changes
    useEffect(() => {
        if (product?.variations) {
            setStockData(product.variations.map(v => ({
                id: v.id,
                name: v.name || v.variation_name,
                value: v.value || v.variation_value,
                stock: v.stock ?? 0,
                price: v.price
            })))
        }
    }, [product])

    const updateStock = (index, newStock) => {
        const updated = [...stockData]
        updated[index] = { ...updated[index], stock: parseInt(newStock) || 0 }
        setStockData(updated)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!product?.id) {
            toast.error("No product selected")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(`${apiEndpoint}/seller/products/${product.id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    variations: stockData.map(v => ({
                        id: v.id,
                        stock: v.stock
                    }))
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update stock')
            }

            toast.success("Stock updated successfully!")
            onOpenChange(false)

            // Refresh products list
            if (fetchProducts) {
                fetchProducts()
            }

            if (onSuccess) {
                onSuccess()
            }

        } catch (error) {
            console.error('Error updating stock:', error)
            toast.error(error.message || "Failed to update stock")
        } finally {
            setIsLoading(false)
        }
    }

    const getTotalStock = () => stockData.reduce((sum, v) => sum + (v.stock || 0), 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cube className="h-5 w-5" />
                        Update Stock
                    </DialogTitle>
                    <DialogDescription>
                        {product?.title ? (
                            <span className="flex items-center gap-2 mt-1">
                                <Package className="h-4 w-4" />
                                {product.title}
                            </span>
                        ) : (
                            "Update inventory levels for product variants"
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {stockData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Cube className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No variants found for this product.</p>
                            <p className="text-sm">Add variants to manage stock levels.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-2 text-xs text-muted-foreground font-medium">
                                <div className="col-span-5">Variant</div>
                                <div className="col-span-3">Price</div>
                                <div className="col-span-4">Stock</div>
                            </div>

                            {/* Stock items */}
                            {stockData.map((variant, index) => (
                                <div
                                    key={variant.id || index}
                                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card"
                                >
                                    <div className="col-span-5">
                                        <div className="text-sm font-medium">{variant.value}</div>
                                        <div className="text-xs text-muted-foreground">{variant.name}</div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-sm text-muted-foreground">
                                            KES {(variant.price || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={variant.stock}
                                            onChange={(e) => updateStock(index, e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Summary */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <span className="text-sm font-medium">Total Stock</span>
                                <Badge variant="secondary" className="text-sm px-3">
                                    {getTotalStock()} units
                                </Badge>
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
                        <Button
                            type="submit"
                            disabled={isLoading || stockData.length === 0}
                        >
                            {isLoading ? "Updating..." : "Update Stock"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
