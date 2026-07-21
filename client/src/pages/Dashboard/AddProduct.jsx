import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { X, Upload, ImageIcon, Star, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  "Laptops",
  "Smartphones",
  "Tablets",
  "Accessories",
  "Monitors",
  "Printers",
  "Networking",
  "Storage",
];

const brands = [
  "Apple",
  "Samsung",
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "Acer",
  "Microsoft",
];

// React Quill Configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["blockquote", "code-block"],
    [{ script: "sub" }, { script: "super" }],
    ["link", "image", "video"],
    ["clean"],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
  "code-block",
  "script",
  "font",
  "size",
];

// Builds the cartesian product of sizes/colors. Either can be empty —
// e.g. sizes only (no colors) still produces one variant per size.
const buildCombos = (sizes, colors) => {
  if (sizes.length && colors.length) {
    return sizes.flatMap((size) => colors.map((color) => ({ size, color })));
  }
  if (sizes.length) return sizes.map((size) => ({ size, color: null }));
  if (colors.length) return colors.map((color) => ({ size: null, color }));
  return [];
};

const comboKey = (size, color) => `${size || ""}__${color || ""}`;

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Variant (size/color) state ---
  const [hasVariants, setHasVariants] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: "",
      brand: "",
      category: "",
      price: "",
      stock: "",
      discount: "",
      sku: "",
      warranty: "",
      description: "",
      status: "draft",
      isPublished: false,
      isFeatured: false,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const basePrice = watch("price");

  // Keep the variants array in sync with the current sizes/colors tags.
  // Preserves price/stock/sku already entered for combos that still exist.
  useEffect(() => {
    if (!hasVariants) return;

    const combos = buildCombos(sizes, colors);
    const comboKeys = combos.map((c) => comboKey(c.size, c.color));
    const existingKeys = fields.map((f) => comboKey(f.size, f.color));

    // remove stale rows (walk backwards so indices stay valid)
    for (let i = fields.length - 1; i >= 0; i--) {
      if (!comboKeys.includes(existingKeys[i])) remove(i);
    }

    // add new rows for combos that don't exist yet
    combos.forEach((c) => {
      if (!existingKeys.includes(comboKey(c.size, c.color))) {
        append({
          size: c.size,
          color: c.color,
          price: "",
          stock: "",
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, colors, hasVariants]);

  const addSize = () => {
    const value = sizeInput.trim();
    if (value && !sizes.includes(value)) setSizes((prev) => [...prev, value]);
    setSizeInput("");
  };

  const addColor = () => {
    const value = colorInput.trim();
    if (value && !colors.includes(value)) setColors((prev) => [...prev, value]);
    setColorInput("");
  };

  const removeSize = (value) =>
    setSizes((prev) => prev.filter((s) => s !== value));

  const removeColor = (value) =>
    setColors((prev) => prev.filter((c) => c !== value));

  const toggleVariants = (checked) => {
    setHasVariants(checked);
    if (!checked) {
      // clear everything when turning variants off so stale data
      // doesn't get submitted silently
      setSizes([]);
      setColors([]);
      for (let i = fields.length - 1; i >= 0; i--) remove(i);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const addImageUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const updateImageUrl = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length === 0 ? [""] : newUrls);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    const resolvedVariants = (data.variants || []).map((v) => ({
      size: v.size || null,
      color: v.color || null,
      // falls back to the base price when left blank
      price: v.price ? Number(v.price) : Number(data.price),
      stock: v.stock ? Number(v.stock) : 0,
    }));

    const formData = {
      title: data.productName,
      slug: data.productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      description: data.description,
      price: Number(data.price),
      compareAtPrice: data.discount
        ? Math.round(Number(data.price) * (1 + Number(data.discount) / 100))
        : null,
      brand: data.brand,
      category: data.category,
      sku: data.sku,
      warranty: data.warranty,
      stock: hasVariants
        ? resolvedVariants.reduce((sum, v) => sum + v.stock, 0)
        : Number(data.stock),
      isPublished: data.isPublished,
      isArchived: data.status === "archived",
      isFeatured: data.isFeatured,
      uploadedImages: images,
      imageUrls: imageUrls.filter((url) => url.trim() !== ""),
      hasVariants,
      variants: hasVariants ? resolvedVariants : [],
    };

    console.log("Form submitted:", formData);

    // TODO: Send to your API
    // await axios.post("/api/products", formData);

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="MacBook Pro M4"
                {...register("productName", {
                  required: "Product name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                })}
              />
              {errors.productName && (
                <p className="text-sm text-red-500">
                  {errors.productName.message}
                </p>
              )}
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">
                Brand <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="brand"
                control={control}
                rules={{ required: "Brand is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                {hasVariants ? "Base Price (৳)" : "Price (৳)"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="120000"
                {...register("price", {
                  required: "Price is required",
                  min: 0.01,
                })}
              />
              {hasVariants && (
                <p className="text-xs text-muted-foreground">
                  Used as the fallback for any variant left without its own
                  price.
                </p>
              )}
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            {/* Stock — hidden once variants take over stock tracking */}
            {!hasVariants && (
              <div className="space-y-2">
                <Label htmlFor="stock">
                  Stock Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="25"
                  {...register("stock", {
                    required: "Stock is required",
                    min: 0,
                  })}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </div>
            )}

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="10"
                {...register("discount", { min: 0, max: 100 })}
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                placeholder="SKU-123456"
                {...register("sku", { required: "SKU is required" })}
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>

            {/* Warranty */}
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty</Label>
              <Input
                id="warranty"
                placeholder="1 Year Official Warranty"
                {...register("warranty")}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* isPublished Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <Controller
                name="isPublished"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="cursor-pointer text-base font-medium">
                Publish this product
              </Label>
            </div>

            {/* isFeatured Toggle */}
            <div className="flex items-center gap-3">
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label className="flex items-center gap-2 cursor-pointer text-base font-medium">
                <Star className="w-4 h-4 text-yellow-500" />
                Mark as Featured
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size / Color Variants */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Switch checked={hasVariants} onCheckedChange={toggleVariants} />
            <Label className="cursor-pointer text-lg font-semibold">
              This product has sizes / colors
            </Label>
          </div>

          {hasVariants && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sizes */}
                <div className="space-y-2">
                  <Label>Sizes (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. S, M, L or 128GB, 256GB"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSize();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSize}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sizes.map((size) => (
                        <Badge
                          key={size}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <Label>Colors (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Black, Silver, Gold"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addColor();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addColor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {colors.map((color) => (
                        <Badge
                          key={color}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Generated variant rows */}
              {fields.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Variant Pricing & Stock
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Leave price blank to use the base price (৳
                    {basePrice || "0"}).
                  </p>

                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-2 gap-3 rounded-lg border p-3 md:grid-cols-5 md:items-end"
                      >
                        <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1">
                          {field.size && (
                            <Badge variant="outline">{field.size}</Badge>
                          )}
                          {field.color && (
                            <Badge variant="outline">{field.color}</Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Price (৳)</Label>
                          <Input
                            type="number"
                            placeholder={basePrice || "0"}
                            {...register(`variants.${index}.price`, {
                              min: 0,
                            })}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-3">
                          <Label className="text-xs">
                            Stock <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(`variants.${index}.stock`, {
                              required: true,
                              min: 0,
                            })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Product Images (Max 5)
            </Label>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload").click()}
                disabled={images.length >= 5}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Images
              </Button>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <span className="text-sm text-muted-foreground">
                {images.length}/5 images
              </span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Image URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Or Add Image URLs</Label>
                {imageUrls.filter((url) => url.trim() !== "").length <
                  5 - images.length && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrl}
                  >
                    <ImageIcon className="mr-2 h-3 w-3" />
                    Add URL
                  </Button>
                )}
              </div>

              {imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                  />
                  {imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImageUrl(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Description is required",
                minLength: { value: 10, message: "At least 10 characters" },
              }}
              render={({ field }) => (
                <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write a detailed description..."
                  className="bg-background"
                  style={{ height: "300px", marginBottom: "50px" }}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-12">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            reset();
            setImages([]);
            setImageUrls([""]);
            setSizes([]);
            setColors([]);
            setHasVariants(false);
          }}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </form>
  );
};

export default AddProduct;
