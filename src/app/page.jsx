"use client";
import Image from "next/image"
import Link from "next/link"
import { UserContext } from "./context/UserContext"
import { useContext, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastProvider } from "@/components/ui/toast";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LogIn() {
  const { login, apiEndpoint } = useContext(UserContext)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {toast} = useToast()

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <ToastProvider>
        <Toast/>
        </ToastProvider>
        <form onSubmit={handleSubmit} className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="Email"
                type="Email"
                placeholder="user@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>

            {/* <Button
      onClick={() => {
        console.log('click!!');
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
        })
      }}
    >
      Show Toast
    </Button> */}
          </div>
        </form>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center">
      <Image
      src="/logo.png"
      alt="Logo"
      width="288"
      height="162"
      className="object-contain"
      priority
    />

      </div>
    </div>
  )
}
