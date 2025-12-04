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

  // 3. Labor (Mano de Obra) - Direct Cost Per Pack
  // Now simply the value entered by user per pack
  const laborPackCost = product.laborCostPerPack || 0;
  const laborUnitCost = product.unitsPerPack > 0 ? laborPackCost / product.unitsPerPack : 0;

  // 4. Energy/Gas - REMOVED
  const energyUnitCost = 0;

  // 5. Total Unit Cost (Production only)
  const productionUnitCost = rawMaterialUnitCost + laborUnitCost + energyUnitCost;

  // 6. Total Pack Cost
  const totalPackCost = (productionUnitCost * product.unitsPerPack) + packagingPackCost;

  // 7. Indirects - REMOVED
  const indirectCost = 0; 

  // 8. Final Pricing
  // Price = Cost / (1 - Margin%) to maintain true margin
  
  // Safe calculation to avoid division by zero
  const safeMargin = Math.min(product.targetMargin, 99) / 100;
  const suggestedPrice = totalPackCost / (1 - safeMargin);
  
  const profit = suggestedPrice - totalPackCost;

  return {
    rawMaterialCost: rawMaterialUnitCost * product.unitsPerPack,
    packagingCost: packagingPackCost,
    laborCost: laborPackCost,
    energyCost: 0,
    indirectCost: 0,
    totalUnitCost: productionUnitCost + (packagingPackCost / product.unitsPerPack),
    totalPackCost,
    suggestedPrice,
    profit
  };
};