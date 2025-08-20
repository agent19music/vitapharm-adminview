"use client";
import Image from "next/image"
import Link from "next/link"
import { UserContext } from "@/context/UserContext"
import { useContext, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastProvider } from "@/components/ui/toast";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LogIn() {
  const { login, apiEndpoint } = useContext(UserContext)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const {toast} = useToast()

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <ToastProvider>
        <Toast/>
        </ToastProvider>
        <form onSubmit={handleSubmit} className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-balance text-muted-foreground">
              Enter your username below to login to your camposocial seller profile
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="Username"
                type="text"
                placeholder="usename"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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

         
          </div>
        </form>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center">
      <Image
      src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/logo.png"
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
