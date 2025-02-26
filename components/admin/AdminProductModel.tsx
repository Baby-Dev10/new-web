"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageCarousel } from "../ImageCarousel";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProduct: any) => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onUpdate,
}: ProductModalProps) {
  const [editedProduct, setEditedProduct] = useState(product);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    setEditedProduct(product);
    setSelectedImages([]); // reset new images when product changes
  }, [product]);

  const previewUrls = useMemo(() => {
    return selectedImages.map((file) => URL.createObjectURL(file));
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editedProduct).forEach((key) => {
      if (key !== "image") {
        formData.append(key, editedProduct[key]);
      }
    });
    selectedImages.forEach((file) => {
      formData.append("images", file);
    });

    await onUpdate(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedImages((prevImages) => {
      const newImages = [...prevImages, ...files].slice(0, 5);
      return newImages;
    });
    e.target.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={editedProduct.name}
            onChange={(e) =>
              setEditedProduct({ ...editedProduct, name: e.target.value })
            }
          />
          <Textarea
            placeholder="Description"
            value={editedProduct.description}
            onChange={(e) =>
              setEditedProduct({
                ...editedProduct,
                description: e.target.value,
              })
            }
          />
          <Input
            placeholder="MRP Price"
            type="number"
            value={editedProduct.mrpPrice}
            onChange={(e) =>
              setEditedProduct({ ...editedProduct, mrpPrice: e.target.value })
            }
          />
          <Input
            placeholder="Discount Price"
            type="number"
            value={editedProduct.discountPrice}
            onChange={(e) =>
              setEditedProduct({
                ...editedProduct,
                discountPrice: e.target.value,
              })
            }
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          {editedProduct.image && editedProduct.image.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Current Images:</h3>
              <ImageCarousel images={editedProduct.image} />
            </div>
          )}
          {selectedImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">New Images:</h3>
              <ImageCarousel
                images={previewUrls}
                removable
                onRemove={(index) =>
                  setSelectedImages((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Update Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}