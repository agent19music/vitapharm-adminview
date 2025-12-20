import { useState, useContext, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { UploadSimple, Trash, Plus, X } from "phosphor-react"
import { ProductContext } from '@/context/ProductContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PhotoCard({ product, onNewImages, onDeleteImage }) {
  const { selectedImages, setSelectedImages } = useContext(ProductContext)
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)

  // Get the image URL - handle both string and object formats
  const getImageUrl = (image) => {
    if (!image) return null
    if (typeof image === 'string') return image
    return image.url || image.image_url
  }

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(
      file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    )

    if (validFiles.length > 0) {
      // Store actual File objects for upload
      setSelectedImages(prev => [...(prev || []), ...validFiles])

      // Notify parent if callback provided
      if (onNewImages) {
        onNewImages(validFiles)
      }
    }
  }

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

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const confirmDelete = () => {
    if (imageToDelete && onDeleteImage) {
      onDeleteImage(imageToDelete.id)
      setImageToDelete(null)
    }
  }

  // Get preview for File or existing image
  const getPreviewUrl = (item) => {
    if (item instanceof File) {
      return URL.createObjectURL(item)
    }
    return getImageUrl(item)
  }

  const existingImages = product?.images || []
  const newImages = selectedImages || []
  const totalImages = existingImages.length + newImages.length

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>
            {totalImages} image{totalImages !== 1 ? 's' : ''} • Max 10
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Current Images</p>
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((image, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                    <Image
                      alt={`Product image ${index + 1}`}
                      className="object-cover"
                      fill
                      src={getImageUrl(image)}
                    />
                    <button
                      type="button"
                      onClick={() => setImageToDelete(image)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" weight="bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images to Upload */}
          {newImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">New Images (will upload on save)</p>
              <div className="grid grid-cols-2 gap-2">
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                    <Image
                      alt={`New image ${index + 1}`}
                      className="object-cover"
                      fill
                      src={getPreviewUrl(image)}
                      unoptimized={image instanceof File}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {totalImages < 10 && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative flex aspect-video items-center justify-center rounded-md border-2 border-dashed transition-colors cursor-pointer ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1 text-center p-4">
                <UploadSimple className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Click or drag to upload
                </span>
                <span className="text-xs text-muted-foreground/60">
                  PNG, JPG up to 5MB
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This image will be removed when you save your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
