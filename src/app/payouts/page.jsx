"use client"

import { useContext, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, CurrencyDollar, TrendUp, Wallet, XCircle } from "phosphor-react"
import SideNav from "../components/SideNav"
import { ThemeToggle } from "../components/ThemeToggle"
import { PayoutContext } from "../../context/PayoutContext"
import withAuth from "@/hoc/WithAuth"

function PayoutsPage() {
    const { earnings, payoutHistory, isLoading, isRequesting, requestPayout, formatCurrency } = useContext(PayoutContext)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')

    const handleRequest = async (e) => {
        e.preventDefault()
        const result = await requestPayout(parseFloat(amount), phoneNumber || null)
        if (result.success) {
            setIsDialogOpen(false)
            setAmount('')
            setPhoneNumber('')
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
            case 'pending':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
            case 'processing':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>
            case 'failed':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <SideNav />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
                    <h1 className="text-xl font-semibold">Payouts</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={earnings.pending_earnings <= 0}>
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Request Payout
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                                <form onSubmit={handleRequest}>
                                    <DialogHeader>
                                        <DialogTitle>Request Payout</DialogTitle>
                                        <DialogDescription>
                                            Withdraw your earnings to M-Pesa
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Available Balance</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(earnings.pending_earnings)}
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="amount">Amount to Withdraw</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                min="1"
                                                max={earnings.pending_earnings}
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">M-Pesa Phone Number (optional)</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="e.g., 254712345678"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Leave empty to use your registered phone number
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isRequesting || !amount || parseFloat(amount) > earnings.pending_earnings}>
                                            {isRequesting ? 'Processing...' : 'Request Payout'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 p-4 sm:px-6 space-y-6">
                    {/* Earnings Summary */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {isLoading ? "..." : formatCurrency(earnings.pending_earnings)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Ready to withdraw
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                                <TrendUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : formatCurrency(earnings.total_paid_out)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All-time payouts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                                <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : payoutHistory.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Payout requests
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payout History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>Your recent payout requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p className="text-muted-foreground">Loading payout history...</p>
                            ) : payoutHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No payouts yet</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Phone Number</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Processed At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payoutHistory.map((payout) => (
                                            <TableRow key={payout.id}>
                                                <TableCell>
                                                    {new Date(payout.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(payout.amount)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {payout.phone_number || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(payout.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {payout.processed_at
                                                        ? new Date(payout.processed_at).toLocaleDateString()
                                                        : '-'
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}

export default withAuth(PayoutsPage)
