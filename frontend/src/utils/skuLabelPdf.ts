import jsPDF from "jspdf";
import type { Product } from "@/types";

// A4 layout constants (all in mm)
const MARGIN_X = 11;
const MARGIN_Y = 10;
const LABEL_W = 58;
const LABEL_H = 30;
const H_GAP = 3;
const V_GAP = 4;
export const COLS = 3;
export const ROWS_PER_PAGE = 8;
export const LABELS_PER_PAGE = COLS * ROWS_PER_PAGE; // 24

export function generateSkuLabelPdf(product: Product, count: number): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  for (let i = 0; i < count; i++) {
    const posOnPage = i % LABELS_PER_PAGE;
    const col = posOnPage % COLS;
    const row = Math.floor(posOnPage / COLS);

    if (i > 0 && posOnPage === 0) doc.addPage();

    const x = MARGIN_X + col * (LABEL_W + H_GAP);
    const y = MARGIN_Y + row * (LABEL_H + V_GAP);

    // Border
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, LABEL_W, LABEL_H, 1.5, 1.5);

    // SKU — large bold, vertically centred in the label
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(product.sku, x + LABEL_W / 2, y + LABEL_H / 2 + 2, { align: "center" });
  }

  doc.save(`SKU_${product.sku}_labels.pdf`);
}
