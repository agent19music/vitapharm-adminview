"use client"

import { useContext, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  Plus,
  MagnifyingGlass,
  DotsThreeVertical,
  PencilSimple,
  Trash,
  Eye,
  Archive,
  CheckCircle,
  XCircle,
  Warning,
  Funnel
} from "phosphor-react"
import { toast, Toaster } from "react-hot-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import SideNav from "../components/SideNav"
import EmptyState from "../components/EmptyState"
import { ThemeToggle } from "../components/ThemeToggle"
import withAuth from "@/hoc/WithAuth"
import { ProductContext } from "../../context/ProductContext"
import { UserContext } from "../../context/UserContext"

// Status badge configuration
const statusConfig = {
  active: {
    label: 'Active',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-600 border-green-500/20'
  },
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: PencilSimple,
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20'
  },
  archived: {
    label: 'Archived',
    variant: 'outline',
    icon: Archive,
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  },
  sold_out: {
    label: 'Sold Out',
    variant: 'destructive',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 border-red-500/20'
  }
}

function ProductsPage() {
  const { products, isLoading, deleteProduct, updateProductStatus } = useContext(ProductContext)
  const { authToken } = useContext(UserContext)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    if (!products) return

    let filtered = [...products]

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => (p.status || 'active') === statusFilter)
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, statusFilter])

  const formatCurrency = (amount) => {
    return `Ksh ${(amount || 0).toLocaleString()}`
  }

  // Get the image URL - handle both string and object formats
  const getImageUrl = (images) => {
    if (!images || images.length === 0) return null
    const firstImage = images[0]
    // Handle both formats: string URL or object with url property
    return typeof firstImage === 'string' ? firstImage : firstImage?.url
  }

  const handleStatusChange = async (productId, newStatus) => {
    await updateProductStatus(productId, newStatus)
  }

  const handleDelete = async (productId) => {
    await deleteProduct(productId)
    setProductToDelete(null)
  }

  const getStatusBadge = (product) => {
    const status = product.status || 'active'
    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" weight="bold" />
        {config.label}
      </Badge>
    )
  }

  // Count products by status for filters
  const statusCounts = products?.reduce((acc, p) => {
    const status = p.status || 'active'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SideNav />
      <Toaster />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
          <h1 className="text-xl font-semibold">Products</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Funnel className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({products?.length || 0})</SelectItem>
                <SelectItem value="active">Active ({statusCounts.active || 0})</SelectItem>
                <SelectItem value="draft">Draft ({statusCounts.draft || 0})</SelectItem>
                <SelectItem value="sold_out">Sold Out ({statusCounts.sold_out || 0})</SelectItem>
                <SelectItem value="archived">Archived ({statusCounts.archived || 0})</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/products/addproduct">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-4 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                Manage your product catalog - {filteredProducts?.length || 0} product(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : filteredProducts?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="group">
                        <TableCell>
                          <Link href={`/products/${product.id}`}>
                            <div className="h-12 w-12 rounded-md bg-muted overflow-hidden border hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
                              {getImageUrl(product.images) ? (
                                <Image
                                  src={getImageUrl(product.images)}
                                  alt={product.title}
                                  width={48}
                                  height={48}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/products/${product.id}`} className="hover:underline">
                            <div className="font-medium">{product.title}</div>
                            {product.brand && (
                              <div className="text-xs text-muted-foreground">{product.brand}</div>
                            )}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(product.price)}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="cursor-pointer">
                                {getStatusBadge(product)}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(product.id, 'active')}
                                disabled={product.status === 'active'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Active
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(product.id, 'draft')}
                                disabled={product.status === 'draft'}
                              >
                                <PencilSimple className="h-4 w-4 mr-2 text-slate-600" />
                                Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(product.id, 'sold_out')}
                                disabled={product.status === 'sold_out'}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Sold Out
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(product.id, 'archived')}
                                disabled={product.status === 'archived'}
                              >
                                <Archive className="h-4 w-4 mr-2 text-orange-600" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <DotsThreeVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}/editproduct`}>
                                  <PencilSimple className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setProductToDelete(product)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  type="products"
                  title="No products yet"
                  description="Add your first product to start selling on CampoSocial"
                  action={{ label: "Add Product", href: "/products/addproduct" }}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning className="h-5 w-5 text-red-500" />
              Delete Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.title}"?
              This action cannot be undone and will remove all associated images, variants, and reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(productToDelete?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(ProductsPage)