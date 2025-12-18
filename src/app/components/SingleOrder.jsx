"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Package,
  SpinnerGap,
  Truck,
} from "phosphor-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { useContext, useState } from "react"
import { OrderContext } from "../../context/OrderContext"
import toast from "react-hot-toast"

export default function SingleOrder() {
  const { selectedOrder, updateOrderStatus, orders, setSelectedOrder } = useContext(OrderContext)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleCopyId = () => {
    if (selectedOrder?.ticket_number || selectedOrder?.id) {
      navigator.clipboard.writeText(selectedOrder.ticket_number || selectedOrder.id)
      toast.success('Copied to clipboard')
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return
    setIsUpdating(true)
    await updateOrderStatus(selectedOrder.id, newStatus, {
      trackingNumber: trackingNumber || undefined,
      shippingCarrier: shippingCarrier || undefined
    })
    setIsUpdating(false)
  }

  const handleShippingUpdate = async () => {
    if (!selectedOrder) return
    setIsUpdating(true)
    await updateOrderStatus(selectedOrder.id, 'shipped', {
      trackingNumber,
      shippingCarrier
    })
    setIsUpdating(false)
    toast.success('Shipping info updated')
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Navigate between orders
  const currentIndex = orders.findIndex(o => o.id === selectedOrder?.id)
  const handlePrev = () => {
    if (currentIndex > 0) setSelectedOrder(orders[currentIndex - 1])
  }
  const handleNext = () => {
    if (currentIndex < orders.length - 1) setSelectedOrder(orders[currentIndex + 1])
  }

  if (!selectedOrder) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
          Select an order to view details
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              {selectedOrder.ticket_number || `Order #${selectedOrder.id?.slice(-8)}`}
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={handleCopyId}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy Order ID</span>
              </Button>
            </CardTitle>
            <CardDescription>
              {formatDate(selectedOrder.created_at)}
            </CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className={`capitalize ${getStatusColor(selectedOrder.status)}`}>
              {selectedOrder.status || 'pending'}
            </Badge>
            {selectedOrder.paid && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Paid
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 text-sm">
          {/* Order Items */}
          <div className="grid gap-3">
            <div className="font-semibold">Order Items</div>
            <ul className="grid gap-3">
              {selectedOrder.items?.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {item.product_title || 'Product'} × <span>{item.quantity}</span>
                  </span>
                  <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                </li>
              ))}
              {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                <li className="text-muted-foreground">No items</li>
              )}
            </ul>

            <Separator className="my-2" />

            {/* Totals */}
            <ul className="grid gap-3">
              {selectedOrder.discount_amount > 0 && (
                <li className="flex items-center justify-between text-green-600">
                  <span>Discount ({selectedOrder.discount_code})</span>
                  <span>-KES {selectedOrder.discount_amount.toLocaleString()}</span>
                </li>
              )}
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Total</span>
                <span>KES {selectedOrder.total_price?.toLocaleString() || 0}</span>
              </li>
            </ul>
          </div>

          <Separator className="my-4" />

          {/* Customer & Shipping */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Customer</div>
              <div className="grid gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {selectedOrder.first_name} {selectedOrder.last_name}
                </span>
                <a href={`mailto:${selectedOrder.email}`} className="hover:underline">
                  {selectedOrder.email}
                </a>
                <a href={`tel:${selectedOrder.phone}`} className="hover:underline">
                  {selectedOrder.phone}
                </a>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="font-semibold">Shipping Address</div>
              <address className="grid gap-0.5 not-italic text-muted-foreground">
                <span>{selectedOrder.address}</span>
              </address>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Shipping Update Form */}
          <div className="grid gap-3">
            <div className="font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Details
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="carrier">Carrier</Label>
                <Select
                  value={shippingCarrier || selectedOrder.shipping_carrier || ''}
                  onValueChange={setShippingCarrier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dhl">DHL</SelectItem>
                    <SelectItem value="fedex">FedEx</SelectItem>
                    <SelectItem value="local">Local Delivery</SelectItem>
                    <SelectItem value="pickup">Self Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  placeholder="Enter tracking #"
                  value={trackingNumber || selectedOrder.tracking_number || ''}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleShippingUpdate}
              disabled={isUpdating || (!trackingNumber && !shippingCarrier)}
            >
              {isUpdating ? <SpinnerGap className="h-4 w-4 animate-spin mr-2" /> : null}
              Update & Mark Shipped
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Quick Status Actions */}
          <div className="grid gap-3">
            <div className="font-semibold">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              {['confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
                <Button
                  key={status}
                  variant={selectedOrder.status === status ? 'default' : 'outline'}
                  size="sm"
                  className="capitalize"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdating || selectedOrder.status === status}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            {selectedOrder.payment_mode === 'pay_on_delivery' ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pay on Delivery
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {selectedOrder.paid ? 'Paid Online' : 'Payment Pending'}
              </span>
            )}
          </div>
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                >
                  <CaretLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="text-xs text-muted-foreground px-2">
                  {currentIndex + 1} / {orders.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6"
                  onClick={handleNext}
                  disabled={currentIndex >= orders.length - 1}
                >
                  <CaretRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  )
}