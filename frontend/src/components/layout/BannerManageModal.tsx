import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AddPhotoAlternate as AddPhotoIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { AppModal, AlertMessage, AppTextField, ConfirmModal } from "@/components/common";
import { useApi } from "@/hooks/useApi";
import { bannerApi } from "@/api/bannerApi";
import type { Banner, BannerPayload } from "@/types";

interface BannerManageModalProps {
  open: boolean;
  onClose: () => void;
}

const ADD_FORM_ID = "banner-add-form";

const emptyForm = (): Omit<BannerPayload, "image"> & { image: File | null } => ({
  title: "",
  subtitle: "",
  image: null,
  link_url: "",
  order: 0,
  is_active: true,
});

export const BannerManageModal: FC<BannerManageModalProps> = ({ open, onClose }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { execute: fetchBanners } = useApi(useCallback(() => bannerApi.list(), []));
  const { execute: createBanner, isLoading: creating } = useApi(
    useCallback((p: BannerPayload) => bannerApi.create(p), [])
  );
  const { execute: deleteBanner } = useApi(
    useCallback((id: number) => bannerApi.remove(id), [])
  );

  const load = useCallback(() => {
    fetchBanners().then((r) => {
      if (r.data && Array.isArray(r.data)) setBanners(r.data);
    });
  }, [fetchBanners]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, image: file }));
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { setAddError("Please select an image."); return; }
    setAddError(null);
    const result = await createBanner({ ...form, image: form.image });
    if (result.error) { setAddError(result.error); return; }
    setForm(emptyForm());
    setImagePreview(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteBanner(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <>
      <AppModal
        open={open}
        title="Manage Hero Banners"
        onClose={onClose}
        formId={ADD_FORM_ID}
        saveLabel="Add Banner"
        saveLoading={creating}
        maxWidth={680}
      >
        <Stack spacing={3}>
          {/* Existing banners */}
          {banners.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Current Banners ({banners.length})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={b.image_url}
                          alt={b.title}
                          sx={{ width: 64, height: 40, objectFit: "cover", borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>
                          {b.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{b.order}</TableCell>
                      <TableCell>
                        <Chip
                          label={b.is_active ? "Active" : "Inactive"}
                          size="small"
                          color={b.is_active ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(b)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          <Divider />

          {/* Add new banner form */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Add New Banner
            </Typography>
            <Stack
              component="form"
              id={ADD_FORM_ID}
              onSubmit={handleSubmit}
              spacing={2}
            >
              <AlertMessage message={addError} />
              <AppTextField
                label="Title"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <AppTextField
                label="Subtitle (optional)"
                value={form.subtitle ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              />
              <Stack direction="row" spacing={2}>
                <AppTextField
                  label="Link URL (optional)"
                  value={form.link_url ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                />
                <AppTextField
                  label="Order"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                  sx={{ maxWidth: 90 }}
                />
              </Stack>

              <Box>
                <InputLabel shrink sx={{ mb: 0.5, fontSize: 13 }}>Banner Image *</InputLabel>
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
                      sx={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }}
                    />
                  ) : (
                    <>
                      <AddPhotoIcon sx={{ fontSize: 32, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload banner image (wide format recommended)
                      </Typography>
                    </>
                  )}
                </Box>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                }
                label="Active"
              />
            </Stack>
          </Box>
        </Stack>
      </AppModal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Banner"
        message={`Remove "${deleteTarget?.title}" from the slider?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};
