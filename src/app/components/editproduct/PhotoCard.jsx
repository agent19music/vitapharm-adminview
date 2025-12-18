import { useState, useContext } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Image from "next/image"
import { UploadSimple, X } from "phosphor-react"
import { ProductContext } from '@/context/ProductContext';

export default function PhotoCard({ product }) {
  const { selectedImages, setSelectedImages } = useContext(ProductContext)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(oldImages => [...oldImages, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(oldImages => oldImages.filter((_, i) => i !== index));
  };

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
      <CardContent>
        <div className="grid gap-2">
          {product.images && product.images.map((image, index) => (
            <button key={index}>
              <Image
                alt={`Product image ${index + 1}`}
                className="aspect-square w-full rounded-md object-cover"
                height="720"
                src={`${image.url}`}
                width="480"
              />
            </button>
          ))}
          <hr />
          {selectedImages && selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <button onClick={() => removeSelectedImage(index)} className="absolute top-0 right-0 p-1 bg-white text-red-500">
                <X className="h-4 w-4" />
              </button>

              <Image
                alt={`Selected image ${index + 1}`}
                className="aspect-square w-full rounded-md object-cover"
                height="720"
                src={image}
                width="480"
              />
            </div>
          ))}
          <button className="relative flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
            <UploadSimple className="h-4 w-4 text-muted-foreground" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
