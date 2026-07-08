import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  PackageOpen,
  Star,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import AddProduct from "./AddProduct";
import ManageProductCost from "./ManageProductCost";
import { useProducts } from "@/hooks/useProducts";

const formatCurrency = (value) => `৳${Number(value).toLocaleString("en-BD")}`;

const stockBadge = (stock) => {
  if (stock <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock < 10)
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Low · {stock}
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
      {stock} in stock
    </Badge>
  );
};

const AllProducts = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [costProduct, setCostProduct] = useState(null);
  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  // Debounce search: only fires the API call 500ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCursorStack([null]);
      setPageIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const currentCursor = cursorStack[pageIndex];

  const { data, isLoading, isFetching } = useProducts(
    { search: debouncedSearch || undefined },
    currentCursor,
  );

  const products = data?.data?.products || [];
  const hasMore = data?.data?.hasMore || false;
  const nextCursor = data?.data?.nextCursor || null;

  const handleNext = () => {
    if (!nextCursor) return;
    const newStack = [...cursorStack.slice(0, pageIndex + 1), nextCursor];
    setCursorStack(newStack);
    setPageIndex(pageIndex + 1);
  };

  const handlePrevious = () => {
    if (pageIndex === 0) return;
    setPageIndex(pageIndex - 1);
  };

  const showTableSkeleton = isLoading || isFetching;

  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products and create new ones.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[92vh] w-[98vw] overflow-y-auto rounded-2xl border sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Product</DialogTitle>
              <DialogDescription>
                Fill in all the required product information.
              </DialogDescription>
            </DialogHeader>

            <AddProduct />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card className="max-w-xs">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Products This Page</p>
          <p className="mt-1 text-2xl font-bold">{products.length}</p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {showTableSkeleton ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {debouncedSearch ? "No matching products" : "No products found"}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {debouncedSearch
                ? "Try a different search term."
                : "Click the Add Product button to create your first product."}
            </p>
            {!debouncedSearch && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-md">
                            <AvatarImage
                              src={product.images?.[0]?.url}
                              alt={product.title}
                              className="object-cover"
                            />
                            <AvatarFallback className="rounded-md">
                              {product.title?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium leading-tight">
                              {product.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatCurrency(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{stockBadge(product.stock)}</TableCell>
                      <TableCell>
                        {product.ratingAverage ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.ratingAverage}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCostProduct(product)}
                            >
                              <Calculator className="mr-2 h-4 w-4" />
                              Manage Cost
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t p-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={handlePrevious}
                      className={
                        pageIndex === 0
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive>{pageIndex + 1}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={handleNext}
                      className={
                        !hasMore
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>

      {/* Manage Cost Dialog */}
      <Dialog
        open={Boolean(costProduct)}
        onOpenChange={(open) => !open && setCostProduct(null)}
      >
        <DialogContent className="max-h-[92vh] w-[98vw] overflow-y-auto rounded-2xl border sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Cost — {costProduct?.title}</DialogTitle>
            <DialogDescription>
              Set the cost breakdown and profit margin for this product.
            </DialogDescription>
          </DialogHeader>

          {costProduct && (
            <ManageProductCost
              product={costProduct}
              onSuccess={() => setCostProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProducts;
