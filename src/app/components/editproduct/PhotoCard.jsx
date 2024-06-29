import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import Image from "next/image"
import { Upload } from "lucide-react"

export default function PhotoCard({product}) {
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
      <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Upload</span>
      </button>
    </div>
  </CardContent>
</Card> 
  )
}
