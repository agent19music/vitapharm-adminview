"use client"

import { useContext, useEffect, useState } from "react"
import Link from "next/link"
import {
  CurrencyDollar,
  Package,
  ShoppingCart,
  Star,
  TrendUp,
  ArrowUpRight,
  List,
  Plus,
  Percent,
  Cube
} from "phosphor-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toaster } from "react-hot-toast"

import SideNav from "../components/SideNav"
import EmptyState from "../components/EmptyState"
import { RevenueChart } from "../components/SalesChart"
import { ThemeToggle } from "../components/ThemeToggle"
import { AddProductModal } from "../components/modals/AddProductModal"
import { EditProductModal } from "../components/modals/EditProductModal"
import { StockModal } from "../components/modals/StockModal"
import { DiscountModal } from "../components/modals/DiscountModal"
import withAuth from "@/hoc/WithAuth"
import { UserContext } from "../../context/UserContext"
import { ProductContext } from "../../context/ProductContext"

function Dashboard() {
  const { authToken, sellerProfile } = useContext(UserContext)
  const { products, fetchProducts, fetchDiscounts } = useContext(ProductContext)

  const [dashboardData, setDashboardData] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  // Modal states
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [editProductOpen, setEditProductOpen] = useState(false)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [discountModalOpen, setDiscountModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

  // Fetch dashboard summary
  useEffect(() => {
    if (!authToken) return

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/seller/dashboard-summary`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [authToken, apiEndpoint])

  // Fetch sales over time for chart
  useEffect(() => {
    if (!authToken) return

    const fetchSales = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/seller/sales-over-time?period=${period}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        if (response.ok) {
          const data = await response.json()
          setSalesData(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching sales data:', error)
      }
    }

    fetchSales()
  }, [authToken, apiEndpoint, period])

  const stats = dashboardData?.stats || {}
  const hasData = dashboardData?.has_data

  const formatCurrency = (amount) => {
    return `Ksh ${(amount || 0).toLocaleString()}`
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      processing: 'bg-blue-500/10 text-blue-500',
      shipped: 'bg-purple-500/10 text-purple-500',
      delivered: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-red-500/10 text-red-500'
    }
    return colors[status] || 'bg-muted text-muted-foreground'
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SideNav />
      <Toaster />

      {/* Modals */}
      <AddProductModal
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        onSuccess={() => fetchProducts()}
      />
      <EditProductModal
        open={editProductOpen}
        onOpenChange={setEditProductOpen}
        product={selectedProduct}
        onSuccess={() => fetchProducts()}
      />
      <StockModal
        open={stockModalOpen}
        onOpenChange={setStockModalOpen}
        product={selectedProduct}
        onSuccess={() => fetchProducts()}
      />
      <DiscountModal
        open={discountModalOpen}
        onOpenChange={setDiscountModalOpen}
        onSuccess={() => fetchDiscounts()}
      />

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiscountModalOpen(true)}
            >
              <Percent className="h-4 w-4 mr-1" />
              Create Discount
            </Button>
            <Button
              size="sm"
              onClick={() => setAddProductOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 animate-pulse bg-muted rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.total_orders || 0}</div>
                    <p className="text-xs text-muted-foreground">Orders completed</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-12 animate-pulse bg-muted rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.total_products || 0}</div>
                    <p className="text-xs text-muted-foreground">Active listings</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.average_rating || '—'}</div>
                    <p className="text-xs text-muted-foreground">Out of 5.0</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Your sales performance</CardDescription>
                </div>
                <div className="flex gap-1">
                  {['7d', '30d', '90d'].map((p) => (
                    <Button
                      key={p}
                      variant={period === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPeriod(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {!hasData && !isLoading ? (
                  <EmptyState
                    type="stats"
                    title="No sales data yet"
                    description="Start selling to see your revenue trends here"
                    action={{ label: "Add Product", href: "/products/new" }}
                  />
                ) : (
                  <RevenueChart data={salesData} loading={isLoading} />
                )}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best sellers</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                    ))}
                  </div>
                ) : dashboardData?.top_products?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.top_products.map((product, i) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.units_sold} sold</p>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(product.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    type="products"
                    title="No products yet"
                    description="Add products to see them here"
                    action={{ label: "Add Product", href: "/products/new" }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/orders">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              ) : dashboardData?.recent_orders?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recent_orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.customer}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  type="orders"
                  title="No orders yet"
                  description="When customers place orders, they'll appear here"
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default withAuth(Dashboard)