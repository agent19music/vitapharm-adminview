"use client";
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
import { UserContext } from "../context/UserContext";

export default function AppointmentList({ filter }) {
  const { appointments, setSelectedAppointment, filterAppointments } = useContext(UserContext);
  const filteredAppointments = filterAppointments(filter);

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
          <TableHead className="hidden sm:table-cell">Phone</TableHead>
          <TableHead className="hidden md:table-cell">Created At</TableHead>
          <TableHead className="text-right">Appointment Date</TableHead>
          <TableHead className="text-right">Appointment Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAppointments && filteredAppointments.map((appointment) => (
          <TableRow key={appointment.id} onClick={() => setSelectedAppointment(appointment)}>
            <TableCell>
              <div className="font-medium">
                {appointment.customer_name}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <div className="hidden text-sm text-muted-foreground md:inline">
                {appointment.customer_phone}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {formatDate(appointment.created_at)}
            </TableCell>
            <TableCell className="text-right">
              {formatDate(appointment.date)}
            </TableCell>
            <TableCell className="text-right">
              {appointment.type}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
