"use client"

import * as React from "react"
import { Plus, Trash, GripVertical } from "phosphor-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"

const VARIATION_TYPES = ["Size", "Color", "Material", "Style", "Weight", "Volume"]

export function VariantEditor({
    variants = [],
    onChange,
    basePrice = 0,
    className
}) {
    const addVariant = () => {
        const newVariant = {
            id: null, // null means new, will be assigned by backend
            tempId: Date.now(), // temporary ID for frontend tracking
            name: "Size",
            value: "",
            price: basePrice || 0,
            stock: 0
        }
        onChange([...variants, newVariant])
    }

    const updateVariant = (index, field, value) => {
        const newVariants = [...variants]
        newVariants[index] = {
            ...newVariants[index],
            [field]: value
        }
        onChange(newVariants)
    }

    const removeVariant = (index) => {
        const newVariants = [...variants]
        newVariants.splice(index, 1)
        onChange(newVariants)
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">Product Variants</h3>
                    <p className="text-xs text-muted-foreground">
                        Add size, color, or other variations with different prices/stock
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Variant
                </Button>
            </div>

            {/* No variants message */}
            {variants.length === 0 && (
                <div className="border border-dashed rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        No variants added. Product will be sold as a single item.
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addVariant}
                        className="mt-2"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Variant
                    </Button>
                </div>
            )}

            {/* Variants list */}
            {variants.length > 0 && (
                <div className="space-y-3">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-2 px-2 text-xs text-muted-foreground font-medium">
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Value</div>
                        <div className="col-span-2">Price (KES)</div>
                        <div className="col-span-2">Stock</div>
                        <div className="col-span-3"></div>
                    </div>

                    {variants.map((variant, index) => (
                        <div
                            key={variant.id || variant.tempId || index}
                            className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card"
                        >
                            {/* Variant Type */}
                            <div className="col-span-2">
                                <Select
                                    value={variant.name || "Size"}
                                    onValueChange={(val) => updateVariant(index, 'name', val)}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VARIATION_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value */}
                            <div className="col-span-3">
                                <Input
                                    type="text"
                                    placeholder={variant.name === "Color" ? "e.g. Red" : "e.g. Large"}
                                    value={variant.value || ""}
                                    onChange={(e) => updateVariant(index, 'value', e.target.value)}
                                    className="h-9"
                                />
                            </div>

                            {/* Price */}
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={variant.price || ""}
                                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="h-9"
                                />
                            </div>

                            {/* Stock */}
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    value={variant.stock ?? ""}
                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                />
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex justify-end gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeVariant(index)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {variants.length > 0 && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="text-muted-foreground">
                        {variants.length} variant{variants.length === 1 ? '' : 's'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                        Total stock: {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                        Price range: KES {Math.min(...variants.map(v => v.price || 0)).toLocaleString()} - {Math.max(...variants.map(v => v.price || 0)).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    )
}
