import { CardHeader, CardContent, CardTitle, CardDescription, Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function SingleAppointment() {
  const { selectedAppointment } = useContext(UserContext);
  console.log(selectedAppointment);

  if (!selectedAppointment) {
    return <div>No appointment selected</div>;
  }

  return (
    <div>
      <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <div className="grid gap-0.5">
            {selectedAppointment && selectedAppointment.type && (
              <CardTitle className="group flex items-center gap-2 text-lg">
                Appointment {selectedAppointment.type}
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Appointment Type</span>
                </Button>
              </CardTitle>
            )}
            <CardDescription>Date: {new Date(selectedAppointment.date).toLocaleDateString()}</CardDescription>
          </div>
          {/* <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Appointment</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Trash</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="font-semibold">Appointment Details</div>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Appointment Type</span>
                <span>{selectedAppointment.type}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(selectedAppointment.date).toLocaleDateString()}</span>
              </li>
            </ul>
            <Separator className="my-2" />
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <div className="font-semibold">Customer Information</div>
            <dl className="grid gap-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Customer</dt>
                <dd>{selectedAppointment.customer_name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${selectedAppointment.customer_email}`}>{selectedAppointment.customer_email}</a>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a href={`tel:${selectedAppointment.customer_phone}`}>{selectedAppointment.customer_phone}</a>
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Updated <time dateTime={selectedAppointment.created_at}>{new Date(selectedAppointment.created_at).toLocaleDateString()}</time>
          </div>
          {/* <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Appointment</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Appointment</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination> */}
        </CardFooter>
      </Card>
    </div>
  );
}
