import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Product, CostBreakdown, Ingredient } from "../types";
import { formatCurrency } from "../constants";

export const generateCostPDF = (
  product: Product,
  breakdown: CostBreakdown,
  ingredients: Ingredient[]
) => {
  // Cast to any to handle jspdf-autotable plugin methods and avoid type inheritance issues
  const doc: any = new jsPDF();
  const now = new Date();
  
  // -- HEADER --
  doc.setFillColor(249, 115, 22); // Orange 500
  doc.rect(0, 0, 210, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("UMAMI FÉNIX - ANÁLISIS DE COSTOS", 14, 13);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 150, 13);

  // -- PRODUCT INFO --
  let yPos = 35;
  doc.setTextColor(33, 37, 41);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(product.name.toUpperCase(), 14, yPos);
  
  yPos += 7;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Presentación: ${product.presentation}`, 14, yPos);
  doc.text(`Unidades por paquete: ${product.unitsPerPack}`, 14, yPos + 6);
  
  // -- TABLE 1: MATERIA PRIMA --
  yPos += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(249, 115, 22); // Orange
  doc.text("1. MATERIA PRIMA (Receta Unitaria)", 14, yPos);
  
  const rawData = product.recipe.map(item => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    if (!ing) return [];
    return [
      ing.name,
      `${item.quantity} ${ing.unit}`,
      formatCurrency(ing.cost),
      formatCurrency(ing.cost * item.quantity)
    ];
  });

  doc.autoTable({
    startY: yPos + 3,
    head: [['Ingrediente', 'Cantidad', 'Costo Unit.', 'Subtotal']],
    body: rawData,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85] }, // Slate 700
    styles: { fontSize: 9 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // -- TABLE 2: EMPAQUE --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text("2. MATERIAL DE EMPAQUE (Por Paquete)", 14, yPos);

  const packData = product.packagingRecipe.map(item => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    if (!ing) return [];
    return [
      ing.name,
      `${item.quantity} ${ing.unit}`,
      formatCurrency(ing.cost),
      formatCurrency(ing.cost * item.quantity)
    ];
  });

  doc.autoTable({
    startY: yPos + 3,
    head: [['Material', 'Cantidad', 'Costo Unit.', 'Subtotal']],
    body: packData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    styles: { fontSize: 9 },
  });

  yPos = doc.lastAutoTable.finalY + 20;

  // -- SUMMARY CARD --
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(14, yPos, 180, 75, 3, 3, 'FD');

  doc.setTextColor(33, 37, 41);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN DE RENTABILIDAD", 20, yPos + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  let rowY = yPos + 20;
  const col1 = 20;
  const col2 = 120;
  const lineHeight = 8;

  // Costs
  doc.text("Costo Materia Prima (Total Lote):", col1, rowY);
  doc.text(formatCurrency(breakdown.rawMaterialCost), col2, rowY, { align: 'right' });
  
  rowY += lineHeight;
  doc.text("Costo Empaque:", col1, rowY);
  doc.text(formatCurrency(breakdown.packagingCost), col2, rowY, { align: 'right' });

  rowY += lineHeight;
  doc.text("Costo Mano de Obra:", col1, rowY);
  doc.text(formatCurrency(breakdown.laborCost), col2, rowY, { align: 'right' });

  // Divider
  rowY += 2;
  doc.setDrawColor(200);
  doc.line(col1, rowY, col2, rowY);
  rowY += 6;

  // Totals
  doc.setFont("helvetica", "bold");
  doc.text("COSTO TOTAL PRODUCCIÓN:", col1, rowY);
  doc.text(formatCurrency(breakdown.totalPackCost), col2, rowY, { align: 'right' });

  rowY += lineHeight + 2;
  doc.setFontSize(12);
  doc.setTextColor(234, 88, 12); // Orange text
  doc.text("PRECIO SUGERIDO DE VENTA:", col1, rowY);
  doc.text(formatCurrency(breakdown.suggestedPrice), col2, rowY, { align: 'right' });

  rowY += lineHeight;
  doc.setTextColor(22, 163, 74); // Green text
  doc.text(`GANANCIA NETA (${product.targetMargin}%):`, col1, rowY);
  doc.text(formatCurrency(breakdown.profit), col2, rowY, { align: 'right' });

  // Save
  doc.save(`Analisis_Costos_${product.name.replace(/\s+/g, '_')}.pdf`);
};