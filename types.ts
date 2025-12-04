export enum UnitType {
  KG = 'kg',
  LITER = 'lt',
  UNIT = 'und',
  HOUR = 'hr',
  BATCH = 'lote'
}

export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  unit: UnitType;
  category: 'raw' | 'packaging' | 'indirect' | 'energy'; // Removed 'labor'
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // Quantity per single unit of product (or per pack if packaging)
}

export interface Product {
  id: string;
  name: string;
  presentation: string; // e.g., "x6", "x100"
  unitsPerPack: number;
  recipe: RecipeItem[]; // Ingredients required for ONE single unit
  packagingRecipe: RecipeItem[]; // Ingredients required for the PACK (box, label, bag)
  
  // Production variables
  laborCostPerPack: number; // Direct payment per pack produced
  
  // Financials
  targetMargin: number; // Percentage (e.g., 30%)
}

export interface CostBreakdown {
  rawMaterialCost: number;
  packagingCost: number;
  laborCost: number;
  energyCost: number;
  indirectCost: number;
  totalUnitCost: number;
  totalPackCost: number;
  suggestedPrice: number;
  profit: number;
}

export interface AppData {
  ingredients: Ingredient[];
  products: Product[];
}