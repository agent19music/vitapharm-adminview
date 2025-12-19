"use client"

import * as React from "react"
import { Check, MagnifyingGlass, X } from "phosphor-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Badge } from "./badge"

// Comprehensive e-commerce categories
const CATEGORIES = [
    "Electronics",
    "Fashion & Apparel",
    "Home & Garden",
    "Beauty & Skincare",
    "Health & Wellness",
    "Sports & Fitness",
    "Books & Media",
    "Toys & Games",
    "Food & Beverages",
    "Pet Supplies",
    "Automotive",
    "Baby & Kids",
    "Jewelry & Watches",
    "Bags & Accessories",
    "Arts & Crafts",
    "Office & Stationery",
    "Musical Instruments",
    "Computers & Laptops",
    "Phones & Tablets",
    "Cameras & Photography",
    "Gaming & Consoles",
    "Furniture",
    "Kitchen & Dining",
    "Bedding & Bath",
    "Outdoor & Garden",
    "Fitness Equipment",
    "Camping & Outdoor",
    "Cleaning & Household",
    "Tools & Hardware",
    "Shoes & Footwear",
    "Clothing",
    "Skincare",
    "Makeup",
    "Haircare",
    "Fragrances & Perfumes",
    "Snacks & Treats",
    "Beverages",
    "Groceries",
    "Handmade & Crafts",
    "Vintage & Collectibles",
    "Other"
]

export function CategorySearch({ value, onChange, placeholder = "Search category...", className }) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const inputRef = React.useRef(null)
    const dropdownRef = React.useRef(null)

    // Filter categories based on search (only after 2 chars)
    const filteredCategories = React.useMemo(() => {
        if (search.length < 2) return []
        const lower = search.toLowerCase()
        return CATEGORIES.filter(cat => cat.toLowerCase().includes(lower))
    }, [search])

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (category) => {
        onChange(category)
        setSearch("")
        setOpen(false)
    }

    const handleClear = () => {
        onChange("")
        setSearch("")
        inputRef.current?.focus()
    }

    return (
        <div className={cn("relative", className)}>
            {/* Selected value display */}
            {value ? (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm px-3 py-1.5">
                        {value}
                        <button
                            type="button"
                            onClick={handleClear}
                            className="ml-2 hover:text-destructive"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                </div>
            ) : (
                <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setOpen(e.target.value.length >= 2)
                        }}
                        onFocus={() => {
                            if (search.length >= 2) setOpen(true)
                        }}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Dropdown */}
            {open && filteredCategories.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md"
                >
                    <div className="max-h-60 overflow-auto">
                        {filteredCategories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => handleSelect(category)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    "cursor-pointer outline-none"
                                )}
                            >
                                <Check
                                    className={cn(
                                        "h-4 w-4",
                                        value === category ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No results message */}
            {open && search.length >= 2 && filteredCategories.length === 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 shadow-md"
                >
                    <p className="text-sm text-muted-foreground text-center">
                        No categories found
                    </p>
                </div>
            )}

            {/* Hint text */}
            {!value && search.length > 0 && search.length < 2 && (
                <p className="text-xs text-muted-foreground mt-1">
                    Type at least 2 characters to search
                </p>
            )}
        </div>
    )
}

export { CATEGORIES }
