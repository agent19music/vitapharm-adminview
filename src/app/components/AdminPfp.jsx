
import {React, useContext} from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { UserContext } from '../context/UserContext'  

export default function AdminPfp() {
    const {logout} = useContext(UserContext)
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="overflow-hidden rounded-full"
      >
        <Image
          src="/logo.png"
          width={720}
          height={480}
          alt="Avatar"
          className="overflow-hidden rounded-full"

        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuSeparator />
     <DropdownMenuItem onClick={logout} >Logout</DropdownMenuItem>
      
    </DropdownMenuContent>
  </DropdownMenu>
  )
}
