"use client"

import { useContext, useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast, Toaster } from "react-hot-toast"
import {
    CaretLeft,
    Package,
    PencilSimple,
    Trash,
    Tag,
    CurrencyDollar,
    Image as ImageIcon,
    Stack
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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import SideNav from "@/app/components/SideNav"
import { ThemeToggle } from "@/app/components/ThemeToggle"
import withAuth from "@/hoc/WithAuth"
import { UserContext } from "@/context/UserContext"
import { ProductContext } from "@/context/ProductContext"

function ViewProduct() {
    const router = useRouter()
    const params = useParams()
    const productId = params.id

    const { authToken, apiEndpoint } = useContext(UserContext)
    const { deleteProduct } = useContext(ProductContext)

    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        if (!productId || !apiEndpoint) return

        const fetchProduct = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${apiEndpoint}/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Product not found')
                }

                const data = await response.json()
                setProduct(data)
            } catch (error) {
                console.error('Error fetching product:', error)
                toast.error('Failed to load product')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [productId, apiEndpoint, authToken])

    const handleDelete = async () => {
        try {
            await deleteProduct(productId)
            toast.success('Product deleted successfully')
            router.push('/products')
        } catch (error) {
            toast.error('Failed to delete product')
        }
    }

    const formatCurrency = (amount) => {
        return `Ksh ${(amount || 0).toLocaleString()}`
    }

    // Get the image URL - handle both string and object formats
    const getImageUrl = (image) => {
        if (!image) return null
        return typeof image === 'string' ? image : image?.url
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <SideNav />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <main className="flex-1 p-4 sm:px-6">
                        <div className="mx-auto max-w-4xl">
                            <div className="space-y-6">
                                <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                                <div className="h-96 animate-pulse bg-muted rounded-lg" />
                            </div>
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
                            <p className="text-muted-foreground mb-4">
                                The product you're looking for doesn't exist or has been removed.
                            </p>
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
                                <BreadcrumbPage>{product.title || product.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        {/* Page Title */}
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                                <Link href="/products">
                                    <CaretLeft className="h-4 w-4" />
                                    <span className="sr-only">Back</span>
                                </Link>
                            </Button>
                            <h1 className="flex-1 text-xl font-semibold tracking-tight">
                                {product.title || product.name}
                            </h1>
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                {product.is_active ? 'Active' : 'Draft'}
                            </Badge>
                            <div className="hidden items-center gap-2 md:flex">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/products/${productId}/editproduct`}>
                                        <PencilSimple className="h-4 w-4 mr-1" />
                                        Edit
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete "{product.title || product.name}"?
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Product Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {product.images?.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Main Image */}
                                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                                <Image
                                                    src={getImageUrl(product.images[selectedImage])}
                                                    alt={product.title || product.name}
                                                    width={400}
                                                    height={400}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            {/* Thumbnails */}
                                            {product.images.length > 1 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {product.images.map((image, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setSelectedImage(index)}
                                                            className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-colors ${selectedImage === index
                                                                ? 'border-primary'
                                                                : 'border-transparent hover:border-muted-foreground/50'
                                                                }`}
                                                        >
                                                            <Image
                                                                src={getImageUrl(image)}
                                                                alt={`${product.title || product.name} ${index + 1}`}
                                                                width={64}
                                                                height={64}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                                            <Package className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Price */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CurrencyDollar className="h-5 w-5" />
                                            Pricing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-primary">
                                            {formatCurrency(product.price)}
                                        </div>
                                        {product.compare_at_price && product.compare_at_price > product.price && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-lg text-muted-foreground line-through">
                                                    {formatCurrency(product.compare_at_price)}
                                                </span>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% off
                                                </Badge>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5" />
                                            Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {product.description && (
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                                <p className="text-sm">{product.description}</p>
                                            </div>
                                        )}
                                        {(product.category || product.category_id) && (
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Category</h4>
                                                <Badge variant="outline">{product.category || `Category ${product.category_id}`}</Badge>
                                            </div>
                                        )}
                                        {product.brand && (
                                            <div>
                                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Brand</h4>
                                                <p className="text-sm">{product.brand}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Variants */}
                                {product.variations?.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Stack className="h-5 w-5" />
                                                Variants
                                            </CardTitle>
                                            <CardDescription>
                                                {product.variations.length} variant(s) available
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {product.variations.map((variant, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                                    >
                                                        <div>
                                                            <span className="font-medium">{variant.name}</span>
                                                            {variant.value && (
                                                                <span className="text-muted-foreground ml-1">: {variant.value}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">{formatCurrency(variant.price)}</div>
                                                            {variant.stock !== undefined && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Stock: {variant.stock}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center justify-center gap-2 md:hidden mt-6">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/products/${productId}/editproduct`}>
                                    <PencilSimple className="h-4 w-4 mr-1" />
                                    Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete "{product.title || product.name}"?
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default withAuth(ViewProduct)
