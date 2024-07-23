"use client"
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import SideNav from "../components/SideNav"
import { useContext , useEffect, useState} from "react"
import { OrderContext } from "../context/OrderContext"
import withAuth from "@/hoc/WithAuth"
import { CheckCircle, Hourglass } from "lucide-react"
import { UserContext } from "../context/UserContext"

function Dashboard() {
    const {filteredStatus, orders, calculateEarningsFromPaidOrders, filterOrders} = useContext(OrderContext)
    const {appointments, filterAppointments} = useContext(UserContext)
const [filter, setFilter] = useState('month');
const [monthlyEarnings, setMonthlyEarnings] = useState(0);
const [lastMonthlyEarnings, setLastMonthlyEarnings] = useState(0);
const [monthlyBookings, setMonthlyBookings] = useState(0);
const [lastMonthlyBookings , setLastMonthlyBookings] = useState(0);
const filteredBookings =[]
const lastMonthBookings = []


    useEffect(() => {
  
  // Current Month's Earnings
  const monthlyOrders = filterOrders('month');
  const newMonthlyEarnings = calculateEarningsFromPaidOrders(monthlyOrders);
  setMonthlyEarnings(newMonthlyEarnings);

  // Last Month's Earnings
  const lastMonthOrders = filterOrders('lastMonth');
  const newLastMonthlyEarnings = calculateEarningsFromPaidOrders(lastMonthOrders);
  setLastMonthlyEarnings(newLastMonthlyEarnings);
}, [filter, filterOrders, calculateEarningsFromPaidOrders]);

     useEffect(() => {
  
  // Current Month's Earnings
  const filteredBookings = filterAppointments('month');
  const newMonthlyBookings = filteredBookings.length ;
  setMonthlyBookings(newMonthlyBookings);

  // Last Month's Earnings
  const lastMonthBookings = filterAppointments('lastMonth');
  const lastMonthlyBookings = lastMonthBookings.length;
  setLastMonthlyBookings(lastMonthlyBookings);
}, [filter, filterAppointments, filteredBookings]);

    const monthlyEarningsIncrease = lastMonthlyEarnings === 0 ? 100 : ((monthlyEarnings - lastMonthlyEarnings) / lastMonthlyEarnings) * 100;
const monthlyProgress = Math.min(100, monthlyEarningsIncrease);

const monthlyBookingsIncrease = lastMonthlyBookings === 0 ? 100 : ((monthlyBookings - lastMonthlyBookings) / lastMonthlyBookings) * 100;
  return (
    <div className="flex min-h-screen w-full flex-col pl-8">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
       <SideNav className='mb-4'/>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link href="#" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Customers
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 lg:ml-10">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ksh {monthlyEarnings}</div>
              <p className="text-xs text-muted-foreground">
      {monthlyEarningsIncrease}% {monthlyEarningsIncrease > 0 ? "up" : "down"} from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments Booked
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">
               {monthlyBookingsIncrease}% {monthlyBookingsIncrease > 0 ? "up" : "down"} from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{filteredStatus.length}</div>
              <p className="text-xs text-muted-foreground">
                +7% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
  <CardHeader className="flex flex-row items-center">
    <div className="grid gap-2">
      <CardTitle>Transactions</CardTitle>
      <CardDescription>
        Recent transactions from your store.
      </CardDescription>
    </div>
    <Button asChild size="sm" className="ml-auto gap-1">
      <Link href="/orders">
        View All
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </Button>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {
          orders.slice(0, 5).map((order, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="font-medium">{order.customerFirstName} {order.customerLastName}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  {order.customerEmail}
                </div>
              </TableCell>
              <TableCell>
                {order.status === 'Paid' ? <CheckCircle color="green" size="16" /> : <Hourglass color="orange" size="16" />}
              </TableCell>
              <TableCell className="text-right">Ksh {order.discounted_total.toFixed(2)}</TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  </CardContent>
</Card>


          <Card x-chunk="dashboard-01-chunk-5">
  <CardHeader>
    <CardTitle>Recent Sales</CardTitle>
  </CardHeader>
  <CardContent className="grid gap-8">
    {filteredStatus && filteredStatus.slice(0, 7).map((order, index) => (
      <div className="flex items-center gap-4" key={index}>
        <Avatar className="hidden h-9 w-9 sm:flex">
          <AvatarImage src={`/avatars/0${index+1}.png`} alt="Avatar" />
          <AvatarFallback>{order.customerFirstName[0]}{order.customerLastName[0]}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.customerEmail}
          </p>
        </div>
        <div className="ml-auto font-medium">+Ksh {order.discounted_total.toFixed(2)}</div>
      </div>
    ))}
  </CardContent>
</Card>

        </div>
      </main>
    </div>
  )
}
export default withAuth(Dashboard)