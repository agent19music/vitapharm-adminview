"use client"

import { redirect } from "next/navigation"

// Redirect /products/[id]/edit to /products/[id]/editproduct
export default function EditRedirect({ params }) {
    redirect(`/products/${params.id}/editproduct`)
}
