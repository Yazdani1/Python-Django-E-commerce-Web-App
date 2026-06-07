import type { FC } from "react";
import { useState, useEffect, useCallback, FormEvent } from "react";
import { Box, FormControlLabel, Stack, Switch } from "@mui/material";
import { AppModal, AppTextField, AlertMessage } from "@/components/common";
import { useApi } from "@/hooks/useApi";
import { categoryApi } from "@/api/categoryApi";
import type { Category, CategoryPayload } from "@/types";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category: Category | null;
}

const FORM_ID = "category-form";
const EMPTY: CategoryPayload = { name: "", slug: "", description: "", is_active: true };

export const CategoryFormModal: FC<CategoryFormModalProps> = ({
  open,
  onClose,
  onSaved,
  category,
}) => {
  const isEdit = category !== null;
  const [form, setForm] = useState<CategoryPayload>(EMPTY);

  useEffect(() => {
    setForm(
      isEdit
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description,
            is_active: category.is_active,
          }
        : EMPTY
    );
  }, [category, isEdit]);

  const saveFn = useCallback(
    (payload: CategoryPayload) =>
      isEdit
        ? categoryApi.patch(category!.slug, payload)
        : categoryApi.create(payload),
    [category, isEdit]
  );

  const { execute: save, isLoading, error } = useApi(saveFn);

  const handleChange =
    (field: keyof CategoryPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: CategoryPayload = {
      name: form.name,
      description: form.description,
      is_active: form.is_active,
    };
    if (form.slug?.trim()) payload.slug = form.slug.trim();
    const result = await save(payload);
    if (!result.error) onSaved();
  };

  return (
    <AppModal
      open={open}
      title={isEdit ? "Edit Category" : "New Category"}
      onClose={onClose}
      formId={FORM_ID}
      saveLabel={isEdit ? "Save Changes" : "Create Category"}
      saveLoading={isLoading}
    >
      <AlertMessage message={error} />

      <Box
        component="form"
        id={FORM_ID}
        onSubmit={handleSubmit}
      >
        <Stack spacing={2.5}>
          <AppTextField
            label="Name"
            value={form.name}
            onChange={handleChange("name")}
            required
            autoFocus
            helperText="Slug is auto-generated from name if left blank."
          />
          <AppTextField
            label="Slug (optional)"
            value={form.slug ?? ""}
            onChange={handleChange("slug")}
            placeholder="e.g. home-garden"
          />
          <AppTextField
            label="Description (optional)"
            value={form.description ?? ""}
            onChange={handleChange("description")}
            multiline
            rows={3}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active ?? true}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                color="primary"
              />
            }
            label="Active (visible to the public)"
          />
        </Stack>
      </Box>
    </AppModal>
  );
};
