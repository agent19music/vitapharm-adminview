"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { OrderContext } from "../../context/OrderContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CaretDown, CircleNotch } from "phosphor-react";

export default function OrderList({ filter }) {
  const {
    orders,
    setSelectedOrder,
    filterOrders,
    updateOrderStatus,
    isLoading
  } = useContext(OrderContext);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const filteredOrders = filterOrders(filter);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setUpdatingOrderId(null);
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <CircleNotch className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!filteredOrders || filteredOrders.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No orders found for this period
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden sm:table-cell">Ticket</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="hidden sm:table-cell text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.map((order) => (
          <TableRow
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>
              {order.first_name || order.last_name ? (
                <>
                  <div className="font-medium">
                    {order.first_name} {order.last_name}
                  </div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {order.email}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="hidden sm:table-cell font-mono text-xs">
              {order.ticket_number || order.id?.slice(-8)}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                className="text-xs capitalize"
                variant={getStatusVariant(order.status)}
              >
                {order.status || 'pending'}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {formatDate(order.created_at)}
            </TableCell>
            <TableCell className="text-right font-medium">
              {order.total_price != null
                ? `KES ${order.total_price.toLocaleString()}`
                : '-'
              }
            </TableCell>
            <TableCell className="hidden sm:table-cell text-right" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingOrderId === order.id}
                  >
                    {updatingOrderId === order.id ? (
                      <CircleNotch className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Update
                        <CaretDown className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusUpdate(order.id, status)}
                      className="capitalize"
                      disabled={order.status === status}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
