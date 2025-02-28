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
import { useState, useEffect, useContext } from "react";
import { ProductContext } from "@/app/context/ProductContext";

export default function VariantHandle({ product }) {
const{variants, setVariants} = useContext(ProductContext)

  useEffect(() => {
    setVariants(product.variations);
  }, [product.variations, setVariants]);
  
  const addVariant = () => {
    setVariants([
      ...variants,
      { id: variants.length + 1, price: "", size: "" },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
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
    value={variant.price}
    onChange={(e) => handleInputChange(index, 'price', e.target.value)}
  />
</TableCell>
<TableCell>
  <Label htmlFor={`size-${index}`} className="sr-only">
    Size
  </Label>
  <Input
    id={`size-${index}`}
    type="text"
    value={variant.size}
    onChange={(e) => handleInputChange(index, 'size', e.target.value)}
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
