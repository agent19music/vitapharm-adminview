"use client"

import * as React from "react"
import Image from "next/image"
import { UploadSimple, X, Link as LinkIcon, Trash } from "phosphor-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Badge } from "./badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./select"

export function ImageUploader({
    images = [],
    onImagesChange,
    variants = [],
    onImageVariantLink,
    maxImages = 10,
    className
}) {
    const inputRef = React.useRef(null)
    const [dragActive, setDragActive] = React.useState(false)
    const [imageVariantLinks, setImageVariantLinks] = React.useState({})

    // Handle file selection
    const handleFiles = (files) => {
        const validFiles = Array.from(files).filter(
            file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        )

        const availableSlots = maxImages - images.length
        const newFiles = validFiles.slice(0, availableSlots)

        if (newFiles.length > 0) {
            onImagesChange([...images, ...newFiles])
        }
    }

    // Drag handlers
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files)
        }
    }

    const removeImage = (index) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        onImagesChange(newImages)

        // Clean up variant link
        const newLinks = { ...imageVariantLinks }
        delete newLinks[index]
        setImageVariantLinks(newLinks)
    }

    const handleVariantLink = (imageIndex, variantId) => {
        const newLinks = { ...imageVariantLinks, [imageIndex]: variantId }
        setImageVariantLinks(newLinks)
        if (onImageVariantLink) {
            onImageVariantLink(imageIndex, variantId)
        }
    }

    // Get preview URL for a file or URL string
    const getPreviewUrl = (item) => {
        if (typeof item === 'string') {
            return item
        }
        if (item instanceof File) {
            return URL.createObjectURL(item)
        }
        return item.url || item.image_url
    }

    const canAddMore = images.length < maxImages

    return (
        <div className={cn("space-y-4", className)}>
            {/* Upload area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    !canAddMore && "opacity-50 pointer-events-none"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                    disabled={!canAddMore}
                />

                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="p-3 rounded-full bg-muted">
                        <UploadSimple className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="text-sm font-medium text-primary hover:underline"
                            disabled={!canAddMore}
                        >
                            Click to upload
                        </button>
                        <span className="text-sm text-muted-foreground"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB ({images.length}/{maxImages})
                    </p>
                </div>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => {
                        const previewUrl = getPreviewUrl(image)
                        const linkedVariant = variants.find(v => v.id === imageVariantLinks[index])

                        return (
                            <div
                                key={index}
                                className="relative group rounded-lg border overflow-hidden bg-muted aspect-square"
                            >
                                <Image
                                    src={previewUrl}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized={image instanceof File}
                                />

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeImage(index)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Index badge */}
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {index + 1}
                                    </Badge>
                                </div>

                                {/* Linked variant badge */}
                                {linkedVariant && (
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <Badge className="text-xs truncate max-w-full">
                                            <LinkIcon className="h-3 w-3 mr-1" />
                                            {linkedVariant.value}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Variant linking section - only show if variants exist and images exist */}
            {variants.length > 0 && images.length > 0 && (
                <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Link images to variants (optional)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Useful for color variants - link each image to show for its corresponding color
                    </p>
                    <div className="grid gap-3">
                        {images.map((image, index) => {
                            // Filter to only color variants with valid IDs/values
                            const colorVariants = variants.filter(v =>
                                (v.name?.toLowerCase() === 'color' || v.name?.toLowerCase() === 'colour') &&
                                (v.id || v.tempId || v.value)
                            )

                            // Skip rendering the select if no valid color variants
                            if (colorVariants.length === 0) return null

                            return (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded border overflow-hidden bg-muted relative flex-shrink-0">
                                        <Image
                                            src={getPreviewUrl(image)}
                                            alt={`Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized={image instanceof File}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-20">Image {index + 1}</span>
                                    <Select
                                        value={imageVariantLinks[index] || "none"}
                                        onValueChange={(val) => handleVariantLink(index, val === "none" ? null : val)}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="No variant linked" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No variant linked</SelectItem>
                                            {colorVariants.map((variant) => {
                                                const variantValue = variant.id || variant.tempId || variant.value
                                                return (
                                                    <SelectItem key={variantValue} value={String(variantValue)}>
                                                        {variant.value || 'Unnamed'}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
