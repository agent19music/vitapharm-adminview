import { useState } from 'react';
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import Image from "next/image"
import { Upload } from "lucide-react"

export default function PhotoCard({product}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    // TODO: Add your upload logic here
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
                src={image.url}
                width="480"
              />
            </button>
          ))}
          <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed" onClick={handleUpload}>
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Upload</span>
            <input type="file" onChange={handleFileChange} style={{display: 'none'}} />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
