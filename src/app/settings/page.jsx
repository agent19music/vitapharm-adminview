"use client"

import { useContext, useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Camera, User, Phone, FileText, Storefront, CheckCircle } from "phosphor-react"
import { toast } from "react-hot-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import SideNav from "../components/SideNav"
import { ThemeToggle } from "../components/ThemeToggle"
import withAuth from "@/hoc/WithAuth"
import { UserContext } from "../../context/UserContext"

function SettingsPage() {
    const { authToken, sellerProfile, apiEndpoint } = useContext(UserContext)

    const [displayName, setDisplayName] = useState("")
    const [about, setAbout] = useState("")
    const [phone, setPhone] = useState("")
    const [avatarPreview, setAvatarPreview] = useState("")
    const [avatarFile, setAvatarFile] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    const fileInputRef = useRef(null)

    // Initialize form with existing seller data
    useEffect(() => {
        if (sellerProfile) {
            setDisplayName(sellerProfile.display_name || "")
            setAbout(sellerProfile.about || "")
            setPhone(sellerProfile.phone_no || "")
            setAvatarPreview(sellerProfile.avatar || "")
        }
    }, [sellerProfile])

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!displayName.trim()) {
            toast.error("Display name is required")
            return
        }

        if (!about.trim()) {
            toast.error("About section is required")
            return
        }

        setIsSaving(true)

        try {
            const formData = new FormData()
            formData.append("display_name", displayName.trim())
            formData.append("about", about.trim())
            if (phone.trim()) {
                formData.append("phone", phone.trim())
            }
            if (avatarFile) {
                formData.append("avatar_file", avatarFile)
            } else if (avatarPreview && !avatarFile) {
                formData.append("avatar_url", avatarPreview)
            }

            const response = await fetch(`${apiEndpoint}/seller`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            })

            if (response.ok) {
                toast.success("Profile updated successfully!")
                // Refresh page to get updated data
                window.location.reload()
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to update profile")
            }
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("An error occurred while saving")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <SideNav />

            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:static sm:h-auto sm:border-0 sm:px-6">
                    <h1 className="text-xl font-semibold">Settings</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:gap-8 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Storefront className="h-5 w-5" />
                                <CardTitle>Seller Profile</CardTitle>
                                {sellerProfile?.is_verified && (
                                    <Badge variant="secondary" className="ml-2 bg-blue-500/10 text-blue-500">
                                        <CheckCircle className="h-3 w-3 mr-1" weight="fill" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Manage your public seller profile. This information will be visible to customers on the marketplace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                                    <div className="relative">
                                        <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                                            {avatarPreview ? (
                                                <Image
                                                    src={avatarPreview}
                                                    alt="Profile avatar"
                                                    width={96}
                                                    height={96}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <User className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="font-medium">Profile Picture</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Upload a profile picture that represents your business.
                                            Recommended size: 256x256 pixels.
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Change Photo
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Display Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="flex items-center gap-2">
                                        <Storefront className="h-4 w-4" />
                                        Business Name
                                    </Label>
                                    <Input
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your business or store name"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This is the name customers will see on your products and store page.
                                    </p>
                                </div>

                                {/* About / Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="about" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        About Your Business
                                    </Label>
                                    <Textarea
                                        id="about"
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                        placeholder="Tell customers about your business, what you sell, and what makes you special..."
                                        rows={4}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        A good description helps customers trust your business.
                                    </p>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Business Phone (Optional)
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used for payouts and customer inquiries. This will not be publicly displayed.
                                    </p>
                                </div>

                                <Separator />

                                {/* Submit Button */}
                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.location.reload()}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Account Information</CardTitle>
                            <CardDescription>
                                Read-only information about your seller account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Seller ID</span>
                                    <p className="font-mono text-xs mt-1">{sellerProfile?.id || "—"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Member Since</span>
                                    <p className="mt-1">
                                        {sellerProfile?.created_at
                                            ? new Date(sellerProfile.created_at).toLocaleDateString()
                                            : "—"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Products</span>
                                    <p className="font-semibold mt-1">{sellerProfile?.total_products || 0}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Total Sales</span>
                                    <p className="font-semibold mt-1">{sellerProfile?.total_sales || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}

export default withAuth(SettingsPage)
