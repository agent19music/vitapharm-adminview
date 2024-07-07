import { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProductContext } from "@/app/context/ProductContext";

const categories = [
  "face",
  "lips",
  "eyes",
  "skincare",
  "body",
  "skin",
  "stretchmarks&scars",
].sort();

const sub_categories = [
  "foundation",
  "concealers",
  "settingpowder",
  "prime&set",
  "lipgloss",
  "contour&highlighter",
  "eyeshadow",
  "eyeliner",
  "lipliner",
  "mascara",
  "primers",
  "serum",
  "cleanser",
  "gelpeel",
  "cream",
  "moisturizer",
  "powder",
  "lipstick",
  "brushes",
  "sunscreen",
  "set",
  "toner",
  "facialwash",
  "cleansers&toners",
  "body",
  "treatment",
  "moisturzier",
  "exfoliant",
  "eyecream",
  "lotion",
  "kit",
  "creams",
  "oils",
  "barsoap",
].sort();

export default function CategoryToggle({ product }) {
  const{selectedCategory, selectedSubCategory, setSelectedCategory, setSelectedSubCategory} = useContext(ProductContext)

  useEffect(() => {
    if (product.category) {
      setSelectedCategory(product.category);
    }
    if (product.sub_category) {
      setSelectedSubCategory(product.sub_category);
    }
  }, [product]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSubCategoryChange = (value) => {
    setSelectedSubCategory(value);
  };

  return (
    <Card x-chunk="dashboard-07-chunk-2">
      <CardHeader>
        <CardTitle>Product Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="grid gap-3">
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category" aria-label="Select category">
                <SelectValue>{selectedCategory || "Select category"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="subcategory">Subcategory (optional)</Label>
            <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange}>
              <SelectTrigger id="subcategory" aria-label="Select subcategory">
                <SelectValue>{selectedSubCategory || "Select subcategory"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sub_categories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
