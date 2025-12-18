"use client"

import { useContext, useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ChartBar,
    CurrencyDollar,
    Package,
    ShoppingCart,
    Star,
    TrendUp,
} from "phosphor-react"
import SideNav from "../components/SideNav"
import EmptyState from "../components/EmptyState"
import { ThemeToggle } from "../components/ThemeToggle"
import { RevenueChart } from "../components/SalesChart"
import { AnalyticsContext } from "../../context/AnalyticsContext"
import { PayoutContext } from "../../context/PayoutContext"
import { UserContext } from "../../context/UserContext"
import withAuth from "@/hoc/WithAuth"

function StatsPage() {
    const { analytics, isLoading, fetchAnalytics, formatCurrency, formatNumber } = useContext(AnalyticsContext)
    const { earnings } = useContext(PayoutContext)
    const { authToken } = useContext(UserContext)

    const [salesData, setSalesData] = useState([])
    const [period, setPeriod] = useState('30d')
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

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

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <SideNav />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
                    <h1 className="text-xl font-semibold">Analytics</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : formatCurrency(analytics.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From all paid orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : formatNumber(analytics.total_orders)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Orders containing your products
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "..." : formatNumber(analytics.total_products)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active listings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                {isLoading ? "..." : analytics.average_rating.toFixed(1)}
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                From customer reviews
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Earnings Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Earnings Summary</CardTitle>
                            <CardDescription>Your pending and total payouts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Available to Withdraw</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(earnings?.pending_earnings || 0)}
                                    </p>
                                </div>
                                <TrendUp className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Paid Out</p>
                                    <p className="text-xl font-semibold">
                                        {formatCurrency(earnings?.total_paid_out || 0)}
                                    </p>
                                </div>
                                <CurrencyDollar className="h-6 w-6 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best selling products</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : analytics.top_products.length === 0 ? (
                                <p className="text-muted-foreground">No sales data yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {analytics.top_products.map((product, index) => (
                                        <div key={product.id} className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatNumber(product.units_sold)} units sold
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default withAuth(StatsPage)
