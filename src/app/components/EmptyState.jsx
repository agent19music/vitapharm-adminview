"use client"

import { Package, ShoppingCart, Star, TrendUp, Plus } from "phosphor-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const icons = {
    products: Package,
    orders: ShoppingCart,
    reviews: Star,
    stats: TrendUp,
    default: Package
}

export default function EmptyState({
    type = "default",
    title,
    description,
    action
}) {
    const Icon = icons[type] || icons.default

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
            {action && (
                <Button asChild>
                    <Link href={action.href}>
                        <Plus className="h-4 w-4 mr-2" />
                        {action.label}
                    </Link>
                </Button>
            )}
        </div>
    )
}
