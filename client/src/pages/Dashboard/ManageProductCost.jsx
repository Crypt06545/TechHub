import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch, Controller, useFieldArray } from "react-hook-form";
import { Info, Plus, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AuthToast } from "@/components/common/AuthToast";
import { useUpdateProduct } from "@/hooks/useAdminAnalytics";

const percentFields = [
  {
    key: "platformFeePercent",
    label: "Platform fee",
    max: 20,
    step: 1,
  },
  {
    key: "wastagePercent",
    label: "Wastage / damage buffer",
    max: 15,
    step: 1,
  },
  {
    key: "desiredMarginPercent",
    label: "Desired profit margin",
    max: 80,
    step: 1,
  },
];

/**
 * Default values for an oil.
 *
 * IMPORTANT:
 * The name is NOT hardcoded anymore.
 * It will be filled dynamically from product.title.
 */
const DEFAULT_OIL_VALUES = {
  costPerMl: 30,
  bottleSizeMl: 6,
};

const DEFAULT_OTHER_COSTS = [
  {
    label: "Packaging (bottle, box, label)",
    amount: 80,
  },
  {
    label: "Shipping / delivery",
    amount: 70,
  },
  {
    label: "Marketing (allocated per unit)",
    amount: 50,
  },
  {
    label: "Labor / packing time",
    amount: 30,
  },
];

const baseDefaultValues = {
  mode: "single",
  oils: [],
  otherCosts: DEFAULT_OTHER_COSTS,
  platformFeePercent: 5,
  wastagePercent: 3,
  desiredMarginPercent: 35,
};

/**
 * Creates the default oil dynamically from the product.
 *
 * Example:
 * product.title = "Royal Musk"
 * => oil.name = "Royal Musk"
 */
const createDefaultOil = (product) => ({
  name: product?.title || "",
  costPerMl: DEFAULT_OIL_VALUES.costPerMl,
  bottleSizeMl: DEFAULT_OIL_VALUES.bottleSizeMl,
});

/**
 * Converts stored costBreakdown into form values.
 *
 * Existing saved oil data always has priority.
 * If there is no saved oil data, product.title is used dynamically.
 */
const costBreakdownToFormValues = (costBreakdown, product) => {
  const defaultOil = createDefaultOil(product);

  if (!costBreakdown) {
    return {
      ...baseDefaultValues,
      oils: [defaultOil],
      otherCosts: DEFAULT_OTHER_COSTS,
    };
  }

  const oils = costBreakdown.oils?.length ? costBreakdown.oils : [defaultOil];

  const otherCosts = costBreakdown.otherCosts?.length
    ? costBreakdown.otherCosts
    : DEFAULT_OTHER_COSTS;

  return {
    mode: oils.length > 1 ? "combo" : "single",
    oils,
    otherCosts,
    platformFeePercent:
      costBreakdown.platformFeePercent ?? baseDefaultValues.platformFeePercent,
    wastagePercent:
      costBreakdown.wastagePercent ?? baseDefaultValues.wastagePercent,
    desiredMarginPercent:
      costBreakdown.desiredMarginPercent ??
      baseDefaultValues.desiredMarginPercent,
  };
};

const formatCurrency = (value) =>
  `৳${Math.round(value || 0).toLocaleString("en-BD")}`;

const ManageProductCost = ({ product, onSuccess }) => {
  const { control, handleSubmit, setValue, reset, formState } = useForm({
    defaultValues: {
      ...baseDefaultValues,
      oils: [createDefaultOil(product)],
    },
  });

  const values = useWatch({ control });

  const {
    fields: oilFields,
    append: appendOil,
    remove: removeOil,
  } = useFieldArray({
    control,
    name: "oils",
  });

  const {
    fields: otherCostFields,
    append: appendOtherCost,
    remove: removeOtherCost,
  } = useFieldArray({
    control,
    name: "otherCosts",
  });

  const { mutate, isPending: isSubmitting } = useUpdateProduct();

  /**
   * Local editable copy of product.
   */
  const [localProduct, setLocalProduct] = useState(product);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const hasVariants = Boolean(
    localProduct?.hasVariants && localProduct?.variants?.length,
  );

  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? localProduct.variants[0]._id : null,
  );

  /**
   * Reset selected variant when a genuinely different product is provided.
   */
  useEffect(() => {
    if (product?.hasVariants && product?.variants?.length) {
      setSelectedVariantId(product.variants[0]._id);
    } else {
      setSelectedVariantId(null);
    }
  }, [product]);

  const selectedVariant = hasVariants
    ? localProduct.variants.find((v) => v._id === selectedVariantId)
    : null;

  /**
   * Reload the complete calculator whenever:
   * - selected size changes
   * - a genuinely different product is loaded
   *
   * Existing saved costBreakdown always takes priority.
   * Otherwise product.title becomes the oil name.
   */
  useEffect(() => {
    const activeCostBreakdown = hasVariants
      ? selectedVariant?.costBreakdown
      : localProduct?.costBreakdown;

    reset(costBreakdownToFormValues(activeCostBreakdown, localProduct));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantId, localProduct?._id]);

  const isCombo = values.mode === "combo";

  /**
   * Change Single / Combo mode.
   */
  const handleModeChange = useCallback(
    (mode) => {
      setValue("mode", mode, {
        shouldDirty: true,
      });

      if (mode === "single") {
        /**
         * Keep the first oil when switching back to single.
         *
         * If there isn't one, create it dynamically from product.title.
         */
        const first = values.oils?.[0] || createDefaultOil(localProduct);

        setValue("oils", [first], {
          shouldDirty: true,
        });
      }
    },
    [setValue, values.oils, localProduct],
  );

  /**
   * Confirmation dialog state.
   *
   * { type: "save" }
   * { type: "switch", variantId }
   */
  const [pendingAction, setPendingAction] = useState(null);

  /**
   * Request variant selection.
   */
  const requestSelectVariant = useCallback(
    (variantId) => {
      if (variantId === selectedVariantId) return;

      if (formState.isDirty) {
        setPendingAction({
          type: "switch",
          variantId,
        });

        return;
      }

      setSelectedVariantId(variantId);
    },
    [selectedVariantId, formState.isDirty],
  );

  /**
   * Cost calculation.
   */
  const calculation = useMemo(() => {
    const oilLineItems = (values.oils || []).map((oil) => {
      const cost = Number(oil.costPerMl || 0) * Number(oil.bottleSizeMl || 0);

      return {
        name: oil.name || "Unnamed oil",
        cost,
      };
    });

    const rawMaterialCost = oilLineItems.reduce(
      (sum, oil) => sum + oil.cost,
      0,
    );

    const otherCostLineItems = (values.otherCosts || []).map((item) => ({
      label: item.label || "Unnamed cost",
      amount: Number(item.amount || 0),
    }));

    const otherCost = otherCostLineItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

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
      otherCostLineItems,
      rawMaterialCost,
      otherCost,
      wastageAmount,
      totalCost,
      suggestedPrice,
      platformFeeAmount,
      actualProfit,
      actualMarginPercent,
    };
  }, [values]);

  const finalCostPrice = Math.round(calculation.totalCost);

  /**
   * Save cost information.
   */
  const performSave = useCallback(() => {
    const costBreakdown = {
      oils: values.oils,
      otherCosts: values.otherCosts,
      platformFeePercent: values.platformFeePercent,
      wastagePercent: values.wastagePercent,
      desiredMarginPercent: values.desiredMarginPercent,
    };

    /**
     * VARIANT PRODUCT
     */
    if (hasVariants) {
      if (!selectedVariantId) {
        AuthToast.error("Select a size to save cost for");
        return;
      }

      const updatedVariants = localProduct.variants.map((v) => ({
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        costPrice: v._id === selectedVariantId ? finalCostPrice : v.costPrice,
        costBreakdown:
          v._id === selectedVariantId
            ? costBreakdown
            : (v.costBreakdown ?? null),
      }));

      const formData = new FormData();

      formData.append("hasVariants", "true");
      formData.append("variants", JSON.stringify(updatedVariants));

      mutate(
        {
          id: localProduct._id,
          formData,
        },
        {
          onSuccess: () => {
            AuthToast.success(
              `${selectedVariant?.size || "This size"} — cost saved at ৳${finalCostPrice.toLocaleString(
                "en-BD",
              )}`,
            );

            setLocalProduct((prev) => ({
              ...prev,
              variants: prev.variants.map((v) =>
                v._id === selectedVariantId
                  ? {
                      ...v,
                      costPrice: finalCostPrice,
                      costBreakdown,
                    }
                  : v,
              ),
            }));

            reset(values);
          },

          onError: (err) =>
            AuthToast.error(
              err?.response?.data?.message || "Failed to save cost",
            ),
        },
      );

      return;
    }

    /**
     * SINGLE PRODUCT
     */
    const formData = new FormData();

    formData.append("costPrice", finalCostPrice);

    formData.append("costBreakdown", JSON.stringify(costBreakdown));

    mutate(
      {
        id: localProduct._id,
        formData,
      },
      {
        onSuccess: () => {
          AuthToast.success(
            `Cost price updated to ৳${finalCostPrice.toLocaleString("en-BD")}`,
          );

          setLocalProduct((prev) => ({
            ...prev,
            costPrice: finalCostPrice,
            costBreakdown,
          }));

          onSuccess?.();
        },

        onError: (err) =>
          AuthToast.error(
            err?.response?.data?.message || "Failed to save cost",
          ),
      },
    );
  }, [
    hasVariants,
    selectedVariantId,
    localProduct,
    finalCostPrice,
    values,
    selectedVariant,
    mutate,
    reset,
    onSuccess,
  ]);

  /**
   * Confirmation dialog action.
   */
  const handleConfirmDialogAction = useCallback(() => {
    if (pendingAction?.type === "save") {
      performSave();
    } else if (pendingAction?.type === "switch") {
      setSelectedVariantId(pendingAction.variantId);
    }

    setPendingAction(null);
  }, [pendingAction, performSave]);

  const openSaveConfirmation = useCallback(() => {
    setPendingAction({
      type: "save",
    });
  }, []);

  const variantLabel =
    [selectedVariant?.size, selectedVariant?.color]
      .filter(Boolean)
      .join(" / ") || "this size";

  return (
    <form onSubmit={handleSubmit(openSaveConfirmation)} className="space-y-6">
      {/* Which size are we pricing? */}
      {hasVariants && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-base font-semibold">Which size is this for?</p>

              <p className="text-xs text-muted-foreground">
                Each size has its own oils, other costs and margin — switching
                sizes reloads that size's own numbers below, not the last
                size's.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {localProduct.variants.map((v) => {
                const label = [v.size, v.color].filter(Boolean).join(" / ");

                const isActive = v._id === selectedVariantId;

                const isPriced = Boolean(v.costPrice);

                return (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => requestSelectVariant(v._id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {isPriced && (
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          isActive ? "" : "text-emerald-500"
                        }`}
                      />
                    )}

                    {label || "—"}

                    {isPriced && (
                      <span
                        className={
                          isActive ? "opacity-80" : "text-muted-foreground"
                        }
                      >
                        · ৳{v.costPrice}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
                  appendOil({
                    name: "",
                    costPerMl: DEFAULT_OIL_VALUES.costPerMl,
                    bottleSizeMl: DEFAULT_OIL_VALUES.bottleSizeMl,
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Oil
              </Button>
            )}
          </div>

          {oilFields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border p-4 space-y-4 relative"
            >
              {isCombo && oilFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 text-red-500"
                  onClick={() => removeOil(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Oil Name */}
                <div className="space-y-2 sm:col-span-1">
                  <Label>Oil name</Label>

                  <Controller
                    name={`oils.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={localProduct?.title || "Oil name"}
                      />
                    )}
                  />
                </div>

                {/* Cost Per ML */}
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

                {/* Bottle Size */}
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

              {/* Line Cost */}
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
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">
                {isCombo
                  ? "Other costs (per combo unit)"
                  : "Other costs (per unit)"}
              </p>

              <p className="text-xs text-muted-foreground">
                Name each cost yourself — packaging, shipping, whatever applies
                to this size.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendOtherCost({
                  label: "",
                  amount: 0,
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Cost
            </Button>
          </div>

          {otherCostFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <Controller
                name={`otherCosts.${index}.label`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="e.g. Packaging"
                    className="flex-1"
                  />
                )}
              />

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm text-muted-foreground">৳</span>

                <Controller
                  name={`otherCosts.${index}.amount`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => onChange(Number(e.target.value) || 0)}
                      className="w-24 text-right"
                      min={0}
                    />
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-red-500"
                onClick={() => removeOtherCost(index)}
                disabled={otherCostFields.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-sm font-medium">
            <span>Total other costs</span>

            <span>{formatCurrency(calculation.otherCost)}</span>
          </div>
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
              <div key={`oil-${i}`} className="flex justify-between">
                <span className="text-muted-foreground">Oil — {oil.name}</span>

                <span>{formatCurrency(oil.cost)}</span>
              </div>
            ))}

            {calculation.otherCostLineItems.map((item, i) => (
              <div key={`cost-${i}`} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>

                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}

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
              {hasVariants
                ? `Saving writes this cost — and everything above — to "${
                    selectedVariant?.size || "the selected size"
                  }" only. Switch sizes above to price the others; each one keeps its own numbers.`
                : "This cost data is admin-only and never exposed in the public product API."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : hasVariants
              ? `Save Cost for ${selectedVariant?.size || "this size"}`
              : "Save Cost Details"}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            {pendingAction?.type === "save" ? (
              <>
                <AlertDialogTitle>
                  Save cost for{" "}
                  {hasVariants ? variantLabel : localProduct?.title}?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This sets the cost price to{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(finalCostPrice)}
                  </span>
                  {hasVariants
                    ? ` for "${variantLabel}" only — other sizes stay unchanged.`
                    : "."}
                </AlertDialogDescription>
              </>
            ) : (
              <>
                <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>

                <AlertDialogDescription>
                  You have unsaved cost changes for{" "}
                  <span className="font-semibold text-foreground">
                    {variantLabel}
                  </span>
                  . Switching sizes now will discard them.
                </AlertDialogDescription>
              </>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirmDialogAction}>
              {pendingAction?.type === "save" ? "Save" : "Switch anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default ManageProductCost;
