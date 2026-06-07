import { useEffect, useState } from "react";
import type { FC } from "react";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import { AppModal } from "@/components/common";
import type { Product } from "@/types";
import {
  generateSkuLabelPdf,
  LABELS_PER_PAGE,
  COLS,
  ROWS_PER_PAGE,
} from "@/utils/skuLabelPdf";

interface SkuLabelModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const SkuLabelModal: FC<SkuLabelModalProps> = ({
  product,
  open,
  onClose,
}) => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (product) setCount(Math.max(1, product.stock_quantity));
  }, [product]);

  if (!product) return null;

  const pages = Math.ceil(count / LABELS_PER_PAGE);

  const handleDownload = () => {
    generateSkuLabelPdf(product, count);
    onClose();
  };

  return (
    <AppModal
      open={open}
      title="Print SKU Labels"
      onClose={onClose}
      onSave={handleDownload}
      saveLabel="Download PDF"
      saveDisabled={count < 1}
      maxWidth={420}
    >
      <Stack spacing={2.5}>
        {/* Product details — read only */}
        <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Product
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {product.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              SKU
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              fontFamily="monospace"
              fontSize="0.9rem"
              letterSpacing={0.5}
            >
              {product.sku}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Stock
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {product.stock_quantity}
            </Typography>
          </Box>
        </Stack>

        {/* Label count input */}
        <TextField
          label="Number of labels to print"
          type="number"
          size="small"
          fullWidth
          value={count}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            setCount(isNaN(v) || v < 1 ? 1 : v > 9999 ? 9999 : v);
          }}
          inputProps={{ min: 1, max: 9999 }}
          helperText={
            `${count} label${count !== 1 ? "s" : ""} → ` +
            `${pages} page${pages !== 1 ? "s" : ""} ` +
            `(${COLS} columns × ${ROWS_PER_PAGE} rows = ${LABELS_PER_PAGE} per A4 page)`
          }
        />
      </Stack>
    </AppModal>
  );
};
