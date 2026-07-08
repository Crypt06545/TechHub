import React, { useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Info, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const percentFields = [
  { key: "platformFeePercent", label: "Platform fee", max: 20, step: 1 },
  { key: "wastagePercent", label: "Wastage / damage buffer", max: 15, step: 1 },
  {
    key: "desiredMarginPercent",
    label: "Desired profit margin",
    max: 80,
    step: 1,
  },
];

const otherCostFields = [
  {
    key: "packagingCost",
    label: "Packaging (bottle, box, label)",
    max: 500,
    step: 5,
  },
  { key: "shippingCost", label: "Shipping / delivery", max: 500, step: 5 },
  {
    key: "marketingCostPerUnit",
    label: "Marketing (allocated per unit)",
    max: 500,
    step: 5,
  },
  { key: "laborCost", label: "Labor / packing time", max: 300, step: 5 },
];

const defaultValues = {
  mode: "single",
  oils: [{ name: "Vampire", costPerMl: 30, bottleSizeMl: 6 }],
  packagingCost: 80,
  shippingCost: 70,
  marketingCostPerUnit: 50,
  laborCost: 30,
  platformFeePercent: 5,
  wastagePercent: 3,
  desiredMarginPercent: 35,
};

const formatCurrency = (value) =>
  `৳${Math.round(value || 0).toLocaleString("en-BD")}`;

const ManageProductCost = ({ product }) => {
  const { control, handleSubmit, watch, setValue } = useForm({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "oils",
  });

  const values = watch();
  const isCombo = values.mode === "combo";

  const handleModeChange = (mode) => {
    setValue("mode", mode);
    if (mode === "single") {
      // Combo pack keeps only the first oil when switching back
      const first = values.oils?.[0] || defaultValues.oils[0];
      setValue("oils", [first]);
    }
  };

  const calculation = useMemo(() => {
    const oilLineItems = (values.oils || []).map((oil) => {
      const cost = Number(oil.costPerMl || 0) * Number(oil.bottleSizeMl || 0);
      return { name: oil.name || "Unnamed oil", cost };
    });

    const rawMaterialCost = oilLineItems.reduce((sum, o) => sum + o.cost, 0);

    const otherCost =
      Number(values.packagingCost || 0) +
      Number(values.shippingCost || 0) +
      Number(values.marketingCostPerUnit || 0) +
      Number(values.laborCost || 0);

    const baseCost = rawMaterialCost + otherCost;
    const wastageAmount = baseCost * (Number(values.wastagePercent || 0) / 100);
    const totalCost = baseCost + wastageAmount;

    const denominator =
      1 -
      Number(values.desiredMarginPercent || 0) / 100 -
      Number(values.platformFeePercent || 0) / 100;
    const suggestedPrice =
      denominator > 0 ? totalCost / denominator : totalCost * 2;

    const platformFeeAmount =
      suggestedPrice * (Number(values.platformFeePercent || 0) / 100);
    const actualProfit = suggestedPrice - totalCost - platformFeeAmount;
    const actualMarginPercent =
      suggestedPrice > 0 ? (actualProfit / suggestedPrice) * 100 : 0;

    return {
      oilLineItems,
      rawMaterialCost,
      wastageAmount,
      totalCost,
      suggestedPrice,
      platformFeeAmount,
      actualProfit,
      actualMarginPercent,
    };
  }, [values]);

  const onSubmit = (data) => {
    console.log("Product cost submitted:", {
      productId: product?._id,
      ...data,
      ...calculation,
    });

    // TODO: Send to your API
    // await axios.post(`/api/products/${product._id}/cost`, data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total cost / unit</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(calculation.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Suggested price</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {formatCurrency(calculation.suggestedPrice)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Actual margin</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {Math.round(calculation.actualMarginPercent)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mode Switch */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">Product type</p>
              <p className="text-sm text-muted-foreground">
                {isCombo
                  ? "Combo pack — combines multiple oils into one sellable unit."
                  : "Single product — one oil, one bottle."}
              </p>
            </div>
            <Tabs value={values.mode} onValueChange={handleModeChange}>
              <TabsList>
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="combo">Combo Pack</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Oil Cost Inputs */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">Raw material (oil)</p>
              <p className="text-xs text-muted-foreground">
                Enter cost per ml and bottle size — the line cost is calculated
                automatically.
              </p>
            </div>
            {isCombo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ name: "", costPerMl: 20, bottleSizeMl: 6 })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Oil
              </Button>
            )}
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border p-4 space-y-4 relative"
            >
              {isCombo && fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 text-red-500"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label>Oil name</Label>
                  <Controller
                    name={`oils.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="Vampire" />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Cost per ml (৳)</Label>
                    <Controller
                      name={`oils.${index}.costPerMl`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            onChange(Number(e.target.value) || 0)
                          }
                          className="w-24 text-right"
                          min={0}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name={`oils.${index}.costPerMl`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Slider
                        value={[value]}
                        onValueChange={([val]) => onChange(val)}
                        max={100}
                        step={1}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bottle size (ml)</Label>
                    <Controller
                      name={`oils.${index}.bottleSizeMl`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            onChange(Number(e.target.value) || 0)
                          }
                          className="w-24 text-right"
                          min={0}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name={`oils.${index}.bottleSizeMl`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Slider
                        value={[value]}
                        onValueChange={([val]) => onChange(val)}
                        max={50}
                        step={1}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground mr-2">Line cost:</span>
                <span className="font-medium">
                  {formatCurrency(
                    Number(values.oils?.[index]?.costPerMl || 0) *
                      Number(values.oils?.[index]?.bottleSizeMl || 0),
                  )}
                </span>
              </div>
            </div>
          ))}

          <Separator />
          <div className="flex justify-between text-sm font-medium">
            <span>Total raw material cost</span>
            <span>{formatCurrency(calculation.rawMaterialCost)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Other Costs */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <p className="text-base font-semibold">
            {isCombo
              ? "Other costs (per combo unit)"
              : "Other costs (per unit)"}
          </p>

          {otherCostFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Controller
                  name={field.key}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      id={field.key}
                      type="number"
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value) || 0)}
                      className="w-28 text-right"
                      min={0}
                    />
                  )}
                />
              </div>
              <Controller
                name={field.key}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Slider
                    value={[value]}
                    onValueChange={([val]) => onChange(val)}
                    max={field.max}
                    step={field.step}
                  />
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Percentage Fields */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <p className="text-base font-semibold">Fees and margin (%)</p>

          {percentFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key}>{field.label}</Label>
                <div className="flex items-center gap-1">
                  <Controller
                    name={field.key}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Input
                        id={field.key}
                        type="number"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value) || 0)}
                        className="w-20 text-right"
                        min={0}
                        max={field.max}
                      />
                    )}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Controller
                name={field.key}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Slider
                    value={[value]}
                    onValueChange={([val]) => onChange(val)}
                    max={field.max}
                    step={field.step}
                  />
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4 text-base font-semibold">Full breakdown</p>
          <div className="space-y-2 text-sm">
            {calculation.oilLineItems.map((oil, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">Oil — {oil.name}</span>
                <span>{formatCurrency(oil.cost)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packaging</span>
              <span>{formatCurrency(values.packagingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(values.shippingCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marketing</span>
              <span>{formatCurrency(values.marketingCostPerUnit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labor</span>
              <span>{formatCurrency(values.laborCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wastage buffer</span>
              <span>{formatCurrency(calculation.wastageAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform fee</span>
              <span>{formatCurrency(calculation.platformFeeAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total cost</span>
              <span>{formatCurrency(calculation.totalCost)}</span>
            </div>
            <div className="flex justify-between font-medium text-blue-600">
              <span>Suggested selling price</span>
              <span>{formatCurrency(calculation.suggestedPrice)}</span>
            </div>
            <div className="flex justify-between font-medium text-emerald-600">
              <span>Estimated profit / unit</span>
              <span>{formatCurrency(calculation.actualProfit)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This cost data is admin-only and never exposed in the public
              product API.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit">Save Cost Details</Button>
      </div>
    </form>
  );
};

export default ManageProductCost;
