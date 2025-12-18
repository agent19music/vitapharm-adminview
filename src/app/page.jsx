"use client";
import Image from "next/image"
import Link from "next/link"
import { UserContext } from "@/context/UserContext"
import { useContext, useEffect } from "react"
import { Toast, ToastProvider } from "@/components/ui/toast";

import { Button } from "@/components/ui/button"

export default function LogIn() {
  const { authToken, redirectToLogin, isLoading } = useContext(UserContext)

  useEffect(() => {
    if (!isLoading && authToken) {
      window.location.href = '/dashboard'
    }
  }, [authToken, isLoading])

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <ToastProvider>
        <Toast/>
        </ToastProvider>
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold"      style={{ 

                fontFamily: 'Helvetica',
              }}>Welcome back</h1>
            <p className="text-balance text-muted-foreground">
              Access the CampoSocial seller dashboard with your marketplace account.
            </p>
          </div>
          <div className="grid gap-4">
            <Button type="button" className="w-full" onClick={redirectToLogin} disabled={isLoading}>
              Continue with CampoSocial
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Seller access is powered by the same OAuth credentials you use on the main CampoSocial app.
            </p>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex lg:items-center lg:justify-center">
      <Image
      src="https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
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
