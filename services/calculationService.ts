import { Product, Ingredient, CostBreakdown } from '../types';

export const calculateProductCost = (product: Product, ingredients: Ingredient[]): CostBreakdown => {
  const getIngredientPrice = (id: string) => ingredients.find(i => i.id === id)?.cost || 0;

  // 1. Raw Materials (Masa, Queso, Relleno) - Per SINGLE Unit
  let rawMaterialUnitCost = 0;
  product.recipe.forEach(item => {
    const price = getIngredientPrice(item.ingredientId);
    rawMaterialUnitCost += price * item.quantity;
  });

  // 2. Packaging (Bolsas, Etiquetas) - Per PACK
  let packagingPackCost = 0;
  product.packagingRecipe.forEach(item => {
    const price = getIngredientPrice(item.ingredientId);
    packagingPackCost += price * item.quantity;
  });

  // 3. Labor (Mano de Obra) - Per Unit
  // Cost = (HourlyRate / UnitsPerHour)
  const laborIngredient = ingredients.find(i => i.category === 'labor');
  const hourlyRate = laborIngredient ? laborIngredient.cost : 0;
  const laborUnitCost = product.unitsPerHour > 0 ? hourlyRate / product.unitsPerHour : 0;

  // 4. Energy/Gas (Gastos Indirectos de Fabricación variable) - Per Unit
  // Cost = (BatchCost / BatchSize)
  const energyIngredient = ingredients.find(i => i.category === 'energy');
  const batchCost = energyIngredient ? energyIngredient.cost : 0;
  const energyUnitCost = product.batchSize > 0 ? batchCost / product.batchSize : 0;

  // 5. Total Unit Cost (Production only)
  const productionUnitCost = rawMaterialUnitCost + laborUnitCost + energyUnitCost;

  // 6. Total Pack Cost
  const totalPackCost = (productionUnitCost * product.unitsPerPack) + packagingPackCost;

  // 7. Indirects (Fixed % overhead placeholder or manual input if we had it, strictly using logic above for now)
  const indirectCost = 0; // Can be expanded later

  // 8. Final Pricing
  const profitMarginDecimal = product.targetMargin / 100;
  // Price = Cost / (1 - Margin%) to maintain true margin, OR Cost * (1 + Margin%).
  // Retail standard often uses Markup (Cost * 1.x). Let's use Markup for simplicity in small production unless specified.
  // Actually, standard finance: Revenue - Cost = Margin * Revenue => Price = Cost / (1 - Margin)
  
  // Safe calculation to avoid division by zero
  const safeMargin = Math.min(product.targetMargin, 99) / 100;
  const suggestedPrice = totalPackCost / (1 - safeMargin);
  
  const profit = suggestedPrice - totalPackCost;

  return {
    rawMaterialCost: rawMaterialUnitCost * product.unitsPerPack,
    packagingCost: packagingPackCost,
    laborCost: laborUnitCost * product.unitsPerPack,
    energyCost: energyUnitCost * product.unitsPerPack,
    indirectCost,
    totalUnitCost: productionUnitCost + (packagingPackCost / product.unitsPerPack),
    totalPackCost,
    suggestedPrice,
    profit
  };
};