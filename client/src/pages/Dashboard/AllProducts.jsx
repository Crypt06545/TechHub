import React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AddProduct from "./AddProduct";

const AllProducts = () => {
  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your products and create new ones.
          </p>
        </div>

        <Dialog>
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

      {/* Product Table */}
      <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No Products Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the <strong>Add Product</strong> button to create your first
          product.
        </p>
      </div>
    </div>
  );
};

export default AllProducts;
