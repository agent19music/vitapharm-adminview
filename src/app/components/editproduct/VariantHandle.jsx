import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function VariantHandle({ product }) {
  console.log(product);
  const [variants, setVariants] = useState();
  useEffect(() => {
    setVariants(product.variations);
  }, [product.variations]);
  
  const addVariant = () => {
    setVariants([
      ...variants,
      { id: variants.length + 1, price: "", size: "" },
    ]);
  };

  const removeVariant = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card x-chunk="dashboard-07-chunk-1">
      <CardHeader>
        <CardTitle>Stock</CardTitle>
        <CardDescription>
          Lipsum dolor sit amet, consectetur adipiscing elit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants && variants.map((variant, index) => (
              <TableRow key={index}>
                <TableCell className="font-semibold">
                  GGPC-{variant.id.toString().padStart(3, "0")}
                </TableCell>
                <TableCell>
                  <Label htmlFor={`price-${index}`} className="sr-only">
                    Price
                  </Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    defaultValue={variant.price}
                  />
                </TableCell>
                <TableCell>
                  <Label htmlFor={`size-${index}`} className="sr-only">
                    Size
                  </Label>
                  <Input
                    id={`size-${index}`}
                    type="text"
                    defaultValue={variant.size}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => removeVariant(index)}>
                    <XCircle className="h-3.5 w-3.5" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Button size="sm" variant="ghost" className="gap-1" onClick={addVariant}>
          <PlusCircle className="h-3.5 w-3.5" />
          Add Variant
        </Button>
      </CardFooter>
    </Card>
  );
}
