"use client"
import { usePathname } from 'next/navigation';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { ChartBar, Gear, House, Package, Percent, ShoppingCart, Star, Wallet } from "phosphor-react";

export default function SideNav() {

  const currentPath = usePathname();

  const getLinkClasses = (path) =>
    `flex h-9 w-9 items-center justify-center rounded-lg ${currentPath === path
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:text-foreground'
    } transition-colors md:h-8 md:w-8`;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">CampoSocial</span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard" className={getLinkClasses('/dashboard')}>
                <House className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/orders" className={getLinkClasses('/orders')}>
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Orders</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Orders</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/products" className={getLinkClasses('/products')}>
                <Package className="h-5 w-5" />
                <span className="sr-only">Products</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Products</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/stats" className={getLinkClasses('/stats')}>
                <ChartBar className="h-5 w-5" />
                <span className="sr-only">Stats</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Analytics</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/reviews" className={getLinkClasses('/reviews')}>
                <Star className="h-5 w-5" />
                <span className="sr-only">Reviews</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Reviews</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/discounts" className={getLinkClasses('/discounts')}>
                <Percent className="h-5 w-5" />
                <span className="sr-only">Discounts</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Discounts</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/payouts" className={getLinkClasses('/payouts')}>
                <Wallet className="h-5 w-5" />
                <span className="sr-only">Payouts</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Payouts</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/settings" className={getLinkClasses('/settings')}>
                <Gear className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
