import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { AppButton, AlertMessage, ActionMenu, ConfirmModal } from "@/components/common";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { useApi } from "@/hooks/useApi";
import { categoryApi } from "@/api/categoryApi";
import { useAuth } from "@/hooks/useAuth";
import type { Category } from "@/types";

const CategoriesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff ?? false;

  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { execute: fetchList, isLoading } = useApi(categoryApi.list);
  const { execute: remove, isLoading: isDeleting } = useApi(categoryApi.remove);

  const loadCategories = useCallback(async () => {
    const result = await fetchList();
    if (result.data) setCategories(result.data.results);
  }, [fetchList]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleEdit = (cat: Category) => {
    setEditTarget(cat);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSaved = () => {
    handleModalClose();
    loadCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const result = await remove(deleteTarget.slug);
    if (result.error) {
      setDeleteError(result.error);
    } else {
      setDeleteTarget(null);
      loadCategories();
    }
  };

  const skeletonRows = [...Array(5)].map((_, i) => (
    <TableRow key={i}>
      {[...Array(isAdmin ? 5 : 4)].map((__, j) => (
        <TableCell key={j}><Skeleton /></TableCell>
      ))}
    </TableRow>
  ));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {categories.length} {categories.length === 1 ? "category" : "categories"} total
          </Typography>
        </Box>
        {isAdmin && (
          <AppButton variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Category
          </AppButton>
        )}
      </Box>

      <AlertMessage message={deleteError} />

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ "& .MuiTableCell-head": { fontWeight: 600, bgcolor: "grey.50" } }}>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell align="right" sx={{ width: 56 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? skeletonRows
              : categories.length === 0
              ? (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 5 : 4}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )
              : categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  hover
                  sx={{ "&:last-child td": { borderBottom: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {cat.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {cat.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat.description || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cat.is_active ? "Active" : "Inactive"}
                      size="small"
                      color={cat.is_active ? "success" : "default"}
                      variant="outlined"
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <ActionMenu
                        onEdit={() => handleEdit(cat)}
                        onDelete={() => setDeleteTarget(cat)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit modal */}
      <CategoryFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSaved={handleSaved}
        category={editTarget}
      />

      {/* Delete confirmation */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={isDeleting}
      />
    </Box>
  );
};

export default CategoriesPage;
