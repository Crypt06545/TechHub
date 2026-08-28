import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { X, Upload, ImageIcon, Star, Plus, Loader2 } from "lucide-react";
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
import { AuthToast } from "@/components/common/AuthToast";
import {
  useAdminCategories,
  useCreateProduct,
} from "@/hooks/useAdminAnalytics";

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

const badgeOptions = [
  "Hot Deal",
  "New Arrival",
  "Best Seller",
  "Top Rated",
  "Limited Stock",
  "Trending",
];

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

  // Real API — categories must stay live even though product creation
  // itself is stubbed below.
  const { data: categoriesData, isLoading: categoriesLoading } =
    useAdminCategories();
  const categories = categoriesData?.data?.categories || [];

  const [hasVariants, setHasVariants] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const { mutate, isPending: isSubmitting } = useCreateProduct();
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
      ratingAverage: "",
      costPrice: "",
      lowStockThreshold: "",
      description: "",
      status: "draft",
      isPublished: false,
      isFeatured: false,
      badge: "none",
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const basePrice = watch("price");

  const updateVariants = (newSizes, newColors) => {
    if (!hasVariants) return;

    const combos = buildCombos(newSizes, newColors);
    const comboKeys = combos.map((c) => comboKey(c.size, c.color));
    const currentFields = watch("variants") || [];
    const existingKeys = currentFields.map((f) => comboKey(f.size, f.color));

    for (let i = currentFields.length - 1; i >= 0; i--) {
      if (!comboKeys.includes(existingKeys[i])) {
        remove(i);
      }
    }

    combos.forEach((c) => {
      if (!existingKeys.includes(comboKey(c.size, c.color))) {
        append({
          size: c.size,
          color: c.color,
          price: "",
          costPrice: "",
          stock: "",
        });
      }
    });
  };

  const addSize = () => {
    const value = sizeInput.trim();
    if (value && !sizes.includes(value)) {
      const newSizes = [...sizes, value];
      setSizes(newSizes);
      updateVariants(newSizes, colors);
    }
    setSizeInput("");
  };

  const removeSize = (value) => {
    const newSizes = sizes.filter((s) => s !== value);
    setSizes(newSizes);
    updateVariants(newSizes, colors);
  };

  const addColor = () => {
    const value = colorInput.trim();
    if (value && !colors.includes(value)) {
      const newColors = [...colors, value];
      setColors(newColors);
      updateVariants(sizes, newColors);
    }
    setColorInput("");
  };

  const removeColor = (value) => {
    const newColors = colors.filter((c) => c !== value);
    setColors(newColors);
    updateVariants(sizes, newColors);
  };

  const toggleVariants = (checked) => {
    setHasVariants(checked);
    if (!checked) {
      const currentFields = watch("variants") || [];
      for (let i = currentFields.length - 1; i >= 0; i--) {
        remove(i);
      }
      setSizes([]);
      setColors([]);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      AuthToast.error("You can upload a maximum of 5 images");
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

  const resetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));

    reset();
    setImages([]);
    setImageUrls([""]);
    setSizes([]);
    setColors([]);
    setHasVariants(false);
    const currentFields = watch("variants") || [];
    for (let i = currentFields.length - 1; i >= 0; i--) {
      remove(i);
    }
  };

  const onSubmit = (data) => {
    const resolvedVariants = (data.variants || []).map((v) => ({
      size: v.size || null,
      color: v.color || null,
      price: v.price ? Number(v.price) : Number(data.price),
      costPrice: v.costPrice
        ? Number(v.costPrice)
        : Number(data.costPrice) || 0,
      stock: v.stock ? Number(v.stock) : 0,
    }));

    const formData = new FormData();

    formData.append("title", data.productName);
    formData.append("description", data.description || "");
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("brand", data.brand || "");
    formData.append("sku", data.sku || "");
    formData.append("costPrice", Number(data.costPrice) || 0);
    if (data.lowStockThreshold !== "") {
      formData.append("lowStockThreshold", Number(data.lowStockThreshold));
    }
    formData.append("hasVariants", hasVariants);
    formData.append("isFeatured", data.isFeatured);
    formData.append("badge", data.badge);

    if (data.ratingAverage !== "") {
      formData.append("ratingAverage", Number(data.ratingAverage));
    }

    const isArchived = data.status === "archived";
    const isPublished = !isArchived && data.isPublished;

    formData.append("isPublished", isPublished);
    formData.append("isArchived", isArchived);

    const discount = Number(data.discount);

    if (discount > 0 && discount < 100) {
      formData.append(
        "compareAtPrice",
        Math.round(Number(data.price) / ((100 - discount) / 100)),
      );
    }

    if (hasVariants) {
      formData.append("variants", JSON.stringify(resolvedVariants));
    } else {
      formData.append("stock", Number(data.stock) || 0);
    }

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    const validUrls = imageUrls.filter((url) => url.trim() !== "");

    if (validUrls.length > 0) {
      formData.append("imageUrls", JSON.stringify(validUrls));
    }

    mutate(formData, {
      onSuccess: (response) => {
        AuthToast.success(response?.message || "Product created successfully");
        resetForm();
      },

      onError: (err) => {
        AuthToast.error(
          err?.response?.data?.message || "Failed to create product",
        );
        console.log(err);
      },
    });
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
                <p className="text-xs text-red-500">
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
                <p className="text-xs text-red-500">{errors.brand.message}</p>
              )}
            </div>

            {/* Category — real admin categories, real _id values */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger id="category">
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? "Loading categories..."
                            : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-500">
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
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />
              {hasVariants && (
                <p className="text-xs text-muted-foreground">
                  Used as fallback for variants without price
                </p>
              )}
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="costPrice">
                Cost Price (৳){" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (what you paid — used for profit calculation)
                </span>
              </Label>
              <Input
                id="costPrice"
                type="number"
                placeholder="0"
                {...register("costPrice", {
                  min: { value: 0, message: "Cost cannot be negative" },
                })}
              />
              {basePrice &&
                watch("costPrice") &&
                Number(basePrice) < Number(watch("costPrice")) && (
                  <p className="text-xs text-red-500">
                    ⚠️ Selling price is below cost — this will sell at a loss.
                  </p>
                )}
              {errors.costPrice && (
                <p className="text-xs text-red-500">
                  {errors.costPrice.message}
                </p>
              )}
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">
                Low Stock Alert Below{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (default: 5)
                </span>
              </Label>
              <Input
                id="lowStockThreshold"
                type="number"
                placeholder="5"
                {...register("lowStockThreshold", {
                  min: { value: 0, message: "Min 0" },
                })}
              />
            </div>
            {/* Stock (only when no variants) */}
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
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500">{errors.stock.message}</p>
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
                {...register("discount", {
                  min: { value: 0, message: "Min 0%" },
                  max: { value: 100, message: "Max 100%" },
                })}
              />
              {errors.discount && (
                <p className="text-xs text-red-500">
                  {errors.discount.message}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="SKU-123456" {...register("sku")} />
            </div>

            {/* Initial Rating */}
            <div className="space-y-2">
              <Label
                htmlFor="ratingAverage"
                className="flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                Initial Rating{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (optional, 0–5)
                </span>
              </Label>
              <Input
                id="ratingAverage"
                type="number"
                step="0.1"
                placeholder="0"
                {...register("ratingAverage", {
                  min: { value: 0, message: "Min 0" },
                  max: { value: 5, message: "Max 5" },
                })}
              />
              {errors.ratingAverage && (
                <p className="text-xs text-red-500">
                  {errors.ratingAverage.message}
                </p>
              )}
            </div>

            {/* Status — draft or archived only; publish is controlled by the switch below */}
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
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Badge — single marketing ribbon shown on the product card */}
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Controller
                name="badge"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="badge">
                      <SelectValue placeholder="No badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No badge</SelectItem>
                      {badgeOptions.map((badge) => (
                        <SelectItem key={badge} value={badge}>
                          {badge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Publish switch — the real source of truth for isPublished */}
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
                    Leave price blank to use base price (৳{basePrice || "0"})
                  </p>

                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-2 gap-3 rounded-lg border p-3 md:grid-cols-6 md:items-end"
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
                              min: { value: 0, message: "Min 0" },
                            })}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Cost (৳)</Label>
                          <Input
                            type="number"
                            placeholder={watch("costPrice") || "0"}
                            {...register(`variants.${index}.costPrice`, {
                              min: { value: 0, message: "Min 0" },
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
                              required: "Stock is required",
                              min: { value: 0, message: "Min 0" },
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
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
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
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddProduct;
