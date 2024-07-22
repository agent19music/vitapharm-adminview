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
import { useContext } from "react";
import { OrderContext } from "../context/OrderContext";

export default function OrderList({filter}) {
  const { orders, setSelectedOrder,  filterOrders } = useContext(OrderContext);
 const filteredOrders = filterOrders(filter);
  // Function to format the date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="hidden sm:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders && filteredOrders.map((order) => (
          <TableRow key={order.id} onClick={() => setSelectedOrder(order)}>
            {(order.customerEmail == "" && order.customerFirstName == "")&&
            <TableCell>
              -
              </TableCell>}
            {(order.customerFirstName !== "" && order.customerEmail !== "")&&<TableCell>
              <div className="font-medium">
                {order.customerFirstName} {order.customerLastName}
              </div>
              <div className="hidden text-sm text-muted-foreground md:inline">
                {order.customerEmail}
              </div>
            </TableCell>}
            <TableCell className="hidden sm:table-cell">
              {/* Replace with actual order type */}
              Order Type
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge className="text-xs" variant={order.status === "Paid" ? "secondary" : "outline"}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {formatDate(order.transaction_date)}
            </TableCell>
            {(order.discounted_total == null) && <TableCell className="text-right">-</TableCell>}

           {(order.discounted_total !==null) && <TableCell className="text-right">Ksh {order.discounted_total}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
