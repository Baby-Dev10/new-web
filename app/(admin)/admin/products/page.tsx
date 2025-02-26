"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ProductModal } from "@/components/admin/AdminProductModel";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Save, Trash2, Edit, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Products() {
  const { toast } = useToast();

  const { data, error, mutate, isValidating } = useSWR("/api/admin/products", fetcher, {
    revalidateOnFocus: false,
  });
  
  const initialProduct = {
    name: "",
    description: "",
    category: "",
    subCategory: "",
    mrpPrice: "",
    discountPrice: "",
    sizes: "",
    colors: "",
  };
  
  const [newProduct, setNewProduct] = useState(initialProduct);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionStatus, setActionStatus] = useState<"idle" | "adding" | "editing">("idle");
  
  const previewUrls = useMemo(() => {
    return selectedImages.map((file) => URL.createObjectURL(file));
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);
  
  useEffect(() => {
    if (selectedProduct) {
      setNewProduct({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        category: selectedProduct.category || "",
        subCategory: selectedProduct.subCategory || "",
        mrpPrice: selectedProduct.mrpPrice?.toString() || "",
        discountPrice: selectedProduct.discountPrice?.toString() || "",
        sizes: Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(", ") : "",
        colors: Array.isArray(selectedProduct.colors) ? selectedProduct.colors.join(", ") : "",
      });
      setActionStatus("editing");
    }
  }, [selectedProduct]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newProduct.name) errors.name = "Name is required";
    if (!newProduct.category) errors.category = "Category is required";
    if (!newProduct.mrpPrice) errors.mrpPrice = "MRP Price is required";
    
    // Validate price is a number
    if (newProduct.mrpPrice && isNaN(Number(newProduct.mrpPrice))) {
      errors.mrpPrice = "MRP Price must be a number";
    }
    
    if (newProduct.discountPrice && isNaN(Number(newProduct.discountPrice))) {
      errors.discountPrice = "Discount Price must be a number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearForm = () => {
    setNewProduct(initialProduct);
    setSelectedImages([]);
    setSelectedProduct(null);
    setFormErrors({});
    setActionStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
    
      Object.keys(newProduct).forEach((key) => {
        if (key === "sizes" || key === "colors") {
          const values = newProduct[key as keyof typeof newProduct]
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
          formData.append(key, JSON.stringify(values));
        } else {
          formData.append(key, newProduct[key as keyof typeof newProduct]);
        }
      });
    
      if (selectedImages.length > 0) {
        selectedImages.forEach((file) => {
          formData.append("images", file);
        });
      }
    
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct._id}`
        : "/api/admin/products";
      const method = selectedProduct ? "PUT" : "POST";
    
      const res = await fetch(url, {
        method,
        body: formData,
      });
    
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }
    
      toast({
        title: "Success",
        description: selectedProduct 
          ? "Product updated successfully" 
          : "Product added successfully",
      });
      
      mutate();
      clearForm();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      // Refresh the product list
      mutate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setActionStatus("editing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAddingProduct = () => {
    clearForm();
    setActionStatus("adding");
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load products. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <div className="flex space-x-2">
          {actionStatus === "idle" ? (
            <Button onClick={startAddingProduct}>
              <Plus className="mr-1 h-4 w-4" /> Add New Product
            </Button>
          ) : (
            <Badge variant={actionStatus === "adding" ? "default" : "secondary"} className="py-2">
              {actionStatus === "adding" ? "Adding New Product" : "Editing Product"}
            </Badge>
          )}
          <Button variant="outline" onClick={() => mutate()} disabled={isValidating}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {(actionStatus === "adding" || actionStatus === "editing") && (
        <div className="bg-slate-50 p-4 rounded-lg mb-6 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {actionStatus === "adding" ? "Add New Product" : "Edit Product"}
            </h2>
            <Button variant="ghost" size="sm" onClick={clearForm}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className={formErrors.category ? "border-red-500" : ""}
                />
                {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Sub Category"
                  value={newProduct.subCategory}
                  onChange={(e) => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                />
              </div>
              
              <div>
                <Input
                  placeholder="MRP Price"
                  type="text"
                  value={newProduct.mrpPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, mrpPrice: e.target.value })}
                  className={formErrors.mrpPrice ? "border-red-500" : ""}
                />
                {formErrors.mrpPrice && <p className="text-red-500 text-sm mt-1">{formErrors.mrpPrice}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Discount Price"
                  type="text"
                  value={newProduct.discountPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value })}
                  className={formErrors.discountPrice ? "border-red-500" : ""}
                />
                {formErrors.discountPrice && <p className="text-red-500 text-sm mt-1">{formErrors.discountPrice}</p>}
              </div>
              
              <div>
                <Input
                  placeholder="Sizes (comma separated, e.g. S,M,L)"
                  value={newProduct.sizes}
                  onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                />
              </div>
              
              <div>
                <Input
                  placeholder="Colors (comma separated, e.g. Red,Blue,Green)"
                  value={newProduct.colors}
                  onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                />
              </div>
            </div>
            
            <Textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="min-h-24"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Product Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 hover:file:bg-slate-200"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedImages(Array.from(e.target.files));
                    }
                  }}
                />
              </label>
              
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => {
                          const newImages = [...selectedImages];
                          newImages.splice(index, 1);
                          setSelectedImages(newImages);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedProduct?.image && selectedProduct.image.length > 0 && previewUrls.length === 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Current Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.image.map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Product Image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={clearForm}
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {selectedProduct ? "Update Product" : "Add Product"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {actionStatus === "idle" && (
        <div className="mb-4">
          <Button onClick={startAddingProduct}>
            <Plus className="mr-1 h-4 w-4" /> Add New Product
          </Button>
        </div>
      )}

      {!data ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-lg">
          <p className="text-gray-500 mb-4">No products found</p>
          <Button onClick={startAddingProduct}>
            <Plus className="mr-1 h-4 w-4" /> Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sub Category</TableHead>
                <TableHead>MRP Price</TableHead>
                <TableHead>Discount Price</TableHead>
                <TableHead>Sizes</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product: any) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.subCategory}</TableCell>
                  <TableCell>{product.mrpPrice}</TableCell>
                  <TableCell>{product.discountPrice}</TableCell>
                  <TableCell>{Array.isArray(product.sizes) ? product.sizes.join(", ") : ""}</TableCell>
                  <TableCell>{Array.isArray(product.colors) ? product.colors.join(", ") : ""}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {Array.isArray(product.image) && product.image.slice(0, 3).map((img: string, index: number) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${product.name} Image ${index + 1}`}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ))}
                      {Array.isArray(product.image) && product.image.length > 3 && (
                        <Badge variant="outline" className="flex items-center h-10">
                          +{product.image.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}