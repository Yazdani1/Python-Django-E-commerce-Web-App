import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate as AddPhotoIcon } from "@mui/icons-material";
import { AppModal, AlertMessage, AppTextField } from "@/components/common";
import { useApi } from "@/hooks/useApi";
import { productApi } from "@/api/productApi";
import { categoryApi } from "@/api/categoryApi";
import type { Category, Product, ProductPayload } from "@/types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
}

const FORM_ID = "product-form";

export const ProductFormModal: FC<ProductFormModalProps> = ({
  open,
  onClose,
  onSaved,
  product,
}) => {
  const isEdit = Boolean(product);

  const [form, setForm] = useState<Omit<ProductPayload, "image">>({
    name: "",
    description: "",
    price: "",
    stock_quantity: 0,
    category: null,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveFn = useCallback(
    (payload: ProductPayload) =>
      isEdit && product
        ? productApi.update(product.slug, payload)
        : productApi.create(payload),
    [isEdit, product]
  );

  const { execute: save, isLoading, error, clearError } = useApi(saveFn);
  const { execute: fetchCategories } = useApi(categoryApi.list);

  useEffect(() => {
    if (!open) return;
    fetchCategories().then((result) => {
      if (result.data) setCategories(result.data.results);
    });
  }, [open, fetchCategories]);

  useEffect(() => {
    if (open && product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category: product.category?.id ?? null,
        is_active: product.is_active,
      });
      setImagePreview(product.image_url);
      setImageFile(null);
    } else if (open && !product) {
      setForm({ name: "", description: "", price: "", stock_quantity: 0, category: null, is_active: true });
      setImageFile(null);
      setImagePreview(null);
    }
    clearError();
  }, [open, product, clearError]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await save({ ...form, image: imageFile ?? undefined });
    if (!result.error) {
      onSaved();
      onClose();
    }
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Edit Product" : "New Product"}
      onClose={onClose}
      formId={FORM_ID}
      saveLoading={isLoading}
      maxWidth={560}
    >
      <Stack
        component="form"
        id={FORM_ID}
        onSubmit={handleSubmit}
        spacing={2.5}
      >
        <AlertMessage message={error} />

        <AppTextField
          label="Product Name"
          required
          value={form.name}
          onChange={handleChange("name")}
        />

        <AppTextField
          label="Description"
          multiline
          rows={3}
          value={form.description}
          onChange={handleChange("description")}
        />

        <Stack direction="row" spacing={2}>
          <AppTextField
            label="Price"
            required
            type="number"
            inputProps={{ min: 0.01, step: "0.01" }}
            value={form.price}
            onChange={handleChange("price")}
          />
          <AppTextField
            label="Stock Quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={form.stock_quantity}
            onChange={handleChange("stock_quantity")}
          />
        </Stack>

        <Box>
          <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>
            Category
          </InputLabel>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={form.category ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Image upload */}
        <Box>
          <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>
            Product Image
          </InputLabel>
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
              transition: "all 0.15s",
              overflow: "hidden",
            }}
          >
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="preview"
                sx={{ maxHeight: 160, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }}
              />
            ) : (
              <>
                <AddPhotoIcon sx={{ fontSize: 36, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload an image
                </Typography>
              </>
            )}
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
          {imageFile && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {imageFile.name}
            </Typography>
          )}
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={form.is_active}
              onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
          }
          label="Active"
        />
      </Stack>
    </AppModal>
  );
};
