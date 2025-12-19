"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "phosphor-react";
import { useState, useEffect, useContext } from "react";
import { ProductContext } from "@/context/ProductContext";

const VARIATION_TYPES = ["Size", "Color", "Material", "Style", "Weight", "Volume"]

export default function VariantHandle({ product }) {
  const { variants, setVariants } = useContext(ProductContext)

  useEffect(() => {
    if (product?.variations) {
      // Map backend format to frontend format
      const mappedVariants = product.variations.map(v => ({
        id: v.id,
        name: v.variation_name || v.name || "Size",
        value: v.variation_value || v.value || "",
        price: v.price || 0,
        stock: v.stock || 0
      }))
      setVariants(mappedVariants);
    }
  }, [product?.variations, setVariants]);

  const addVariant = () => {
    const newVariant = {
      id: null, // null means new, will be assigned by backend
      tempId: Date.now(),
      name: "Size",
      value: "",
      price: product?.price || 0,
      stock: 0
    }
    setVariants([...(variants || []), newVariant]);
  };

  const handleInputChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setVariants(newVariants);
  };

  const removeVariant = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
        <CardDescription>
          Add size, color, or other variations with different prices and stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {variants && variants.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[120px]">Price (KES)</TableHead>
                <TableHead className="w-[100px]">Stock</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={variant.id || variant.tempId || index}>
                  <TableCell>
                    <Select
                      value={variant.name || "Size"}
                      onValueChange={(val) => handleInputChange(index, 'name', val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VARIATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder={variant.name === "Color" ? "e.g. Red" : "e.g. Large"}
                      value={variant.value || ""}
                      onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={variant.price || ""}
                      onChange={(e) => handleInputChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={variant.stock ?? ""}
                      onChange={(e) => handleInputChange(index, 'stock', parseInt(e.target.value) || 0)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeVariant(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="border border-dashed rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No variants added. Product will be sold as a single item.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Button type="button" size="sm" variant="ghost" className="gap-1" onClick={addVariant}>
          <PlusCircle className="h-3.5 w-3.5" />
          Add Variant
        </Button>
      </CardFooter>
    </Card>
  );
}
