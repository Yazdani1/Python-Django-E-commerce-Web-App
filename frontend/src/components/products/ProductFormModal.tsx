import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternate as AddPhotoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { AppModal, AlertMessage, AppTextField } from "@/components/common";
import { useApi } from "@/hooks/useApi";
import { productApi } from "@/api/productApi";
import { categoryApi } from "@/api/categoryApi";
import type { Category, Product, ProductImage, ProductPayload } from "@/types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
}

interface PendingImage {
  file: File;
  previewUrl: string;
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
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      setPrimaryPreview(product.image_url);
      setPrimaryFile(null);
      setExistingImages(product.images ?? []);
      setPendingImages([]);
      setRemovedImageIds([]);
    } else if (open && !product) {
      setForm({ name: "", description: "", price: "", stock_quantity: 0, category: null, is_active: true });
      setPrimaryFile(null);
      setPrimaryPreview(null);
      setExistingImages([]);
      setPendingImages([]);
      setRemovedImageIds([]);
    }
    clearError();
  }, [open, product, clearError]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPrimaryFile(file);
    if (file) setPrimaryPreview(URL.createObjectURL(file));
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newPending: PendingImage[] = files.map((f) => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));
    setPendingImages((prev) => [...prev, ...newPending]);
    e.target.value = "";
  };

  const handleRemoveExisting = (imgId: number) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
    setRemovedImageIds((prev) => [...prev, imgId]);
  };

  const handleRemovePending = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await save({ ...form, image: primaryFile ?? undefined });
    if (result.error) return;

    const savedSlug = result.data?.slug ?? product?.slug ?? "";

    // Delete removed existing images
    await Promise.all(
      removedImageIds.map((id) => productApi.removeImage(savedSlug, id))
    );

    // Upload new gallery images
    await Promise.all(
      pendingImages.map((p, idx) =>
        productApi.addImage(savedSlug, p.file, existingImages.length + idx)
      )
    );

    onSaved();
    onClose();
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Edit Product" : "New Product"}
      onClose={onClose}
      formId={FORM_ID}
      saveLoading={isLoading}
      maxWidth={600}
    >
      <Stack component="form" id={FORM_ID} onSubmit={handleSubmit} spacing={2.5}>
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
          <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>Category</InputLabel>
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
            <MenuItem value=""><em>None</em></MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </Box>

        {/* Primary image */}
        <Box>
          <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>Primary Image</InputLabel>
          <Box
            onClick={() => primaryInputRef.current?.click()}
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
            {primaryPreview ? (
              <Box
                component="img"
                src={primaryPreview}
                alt="preview"
                sx={{ maxHeight: 140, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }}
              />
            ) : (
              <>
                <AddPhotoIcon sx={{ fontSize: 36, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Click to upload primary image
                </Typography>
              </>
            )}
          </Box>
          <input ref={primaryInputRef} type="file" accept="image/*" hidden onChange={handlePrimaryChange} />
        </Box>

        {/* Gallery images */}
        <Box>
          <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>Gallery Images</InputLabel>

          {(existingImages.length > 0 || pendingImages.length > 0) && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 1.5,
              }}
            >
              {existingImages.map((img) => (
                <Box
                  key={img.id}
                  sx={{ position: "relative", width: 80, height: 80 }}
                >
                  <Box
                    component="img"
                    src={img.image_url}
                    alt=""
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveExisting(img.id)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "error.main",
                      color: "white",
                      width: 20,
                      height: 20,
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ))}
              {pendingImages.map((p, idx) => (
                <Box key={idx} sx={{ position: "relative", width: 80, height: 80 }}>
                  <Box
                    component="img"
                    src={p.previewUrl}
                    alt=""
                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "2px dashed", borderColor: "primary.light" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePending(idx)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "error.main",
                      color: "white",
                      width: 20,
                      height: 20,
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Box
            onClick={() => galleryInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
              transition: "all 0.15s",
            }}
          >
            <AddPhotoIcon sx={{ fontSize: 24, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Add more images (select multiple)
            </Typography>
          </Box>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleGalleryAdd}
          />
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
