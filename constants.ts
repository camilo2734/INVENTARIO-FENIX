import { AppData, UnitType } from './types';

// Currency Formatter for Colombian Pesos
export const formatCurrency = (value: number) => {
  // Handle invalid numbers gracefully
  if (isNaN(value)) return '$ 0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value);
};

export const DEFAULT_INGREDIENTS = [
  // Raw Materials (Prices in COP - approx)
  { id: '1', name: 'Queso Semiduro (Bloque)', cost: 28000, unit: UnitType.KG, category: 'raw' },
  { id: '2', name: 'Harina de Trigo Todo Uso', cost: 4500, unit: UnitType.KG, category: 'raw' },
  { id: '3', name: 'Margarina Industrial', cost: 12000, unit: UnitType.KG, category: 'raw' },
  { id: '4', name: 'Aceite Vegetal (Bidón)', cost: 9000, unit: UnitType.LITER, category: 'raw' },
  { id: '5', name: 'Carne Molida Premium', cost: 25000, unit: UnitType.KG, category: 'raw' },
  { id: '6', name: 'Pollo (Pechuga)', cost: 22000, unit: UnitType.KG, category: 'raw' },
  { id: '7', name: 'Bocadillo de Guayaba', cost: 11000, unit: UnitType.KG, category: 'raw' },
  { id: '8', name: 'Plátano Macho (Maduro)', cost: 3500, unit: UnitType.KG, category: 'raw' },
  { id: '9', name: 'Papelón / Panela', cost: 6000, unit: UnitType.KG, category: 'raw' },
  { id: '10', name: 'Jamón Ahumado', cost: 26000, unit: UnitType.KG, category: 'raw' },
  { id: '11', name: 'Ricotta / Requesón', cost: 15000, unit: UnitType.KG, category: 'raw' },
  
  // Labor (Hourly rate based on Min Wage + Social Security ~1.8M / 240h)
  { id: 'lab1', name: 'Mano de Obra (Operario)', cost: 7500, unit: UnitType.HOUR, category: 'labor' },
  
  // Energy/Services
  { id: 'eng1', name: 'Gas / Electricidad (Lote Promedio)', cost: 5000, unit: UnitType.BATCH, category: 'energy' },
  
  // Packaging
  { id: 'pkg1', name: 'Bolsa Plástica Transparente x50', cost: 150, unit: UnitType.UNIT, category: 'packaging' },
  { id: 'pkg2', name: 'Bolsa Plástica Transparente x100', cost: 200, unit: UnitType.UNIT, category: 'packaging' },
  { id: 'pkg3', name: 'Caja Cartón Pequeña (x10)', cost: 800, unit: UnitType.UNIT, category: 'packaging' },
  { id: 'pkg4', name: 'Caja Master (x100)', cost: 2500, unit: UnitType.UNIT, category: 'packaging' },
  { id: 'pkg5', name: 'Etiqueta Adhesiva', cost: 100, unit: UnitType.UNIT, category: 'packaging' },
  { id: 'pkg6', name: 'Bandeja Anime/Plástico', cost: 400, unit: UnitType.UNIT, category: 'packaging' },
] as const;

// Helper to create initial products
export const DEFAULT_PRODUCTS = [
  // --- TEQUEÑOS ---
  {
    id: 'p1', name: 'Tequeñón Full Queso', presentation: 'Bandeja x6 (Desayuno)', unitsPerPack: 6,
    unitsPerHour: 100, batchSize: 200, targetMargin: 40,
    recipe: [
      { ingredientId: '1', quantity: 0.035 }, // 35g Cheese
      { ingredientId: '2', quantity: 0.030 }, // 30g Flour
      { ingredientId: '3', quantity: 0.005 }, 
    ],
    packagingRecipe: [{ ingredientId: 'pkg6', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },
  {
    id: 'p2', name: 'Tequeño Fiesta', presentation: 'Bolsa x20', unitsPerPack: 20,
    unitsPerHour: 150, batchSize: 500, targetMargin: 35,
    recipe: [
      { ingredientId: '1', quantity: 0.015 }, // 15g Cheese
      { ingredientId: '2', quantity: 0.018 }, // 18g Flour
      { ingredientId: '3', quantity: 0.003 }, 
    ],
    packagingRecipe: [{ ingredientId: 'pkg1', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },
  {
    id: 'p3', name: 'Tequeño Fiesta', presentation: 'Caja x100 (Mayor)', unitsPerPack: 100,
    unitsPerHour: 150, batchSize: 500, targetMargin: 30,
    recipe: [
      { ingredientId: '1', quantity: 0.015 },
      { ingredientId: '2', quantity: 0.018 },
      { ingredientId: '3', quantity: 0.003 },
    ],
    packagingRecipe: [{ ingredientId: 'pkg4', quantity: 1 }]
  },
  {
    id: 'p4', name: 'Tequeño Guayaba y Queso', presentation: 'Bandeja x12', unitsPerPack: 12,
    unitsPerHour: 120, batchSize: 200, targetMargin: 40,
    recipe: [
      { ingredientId: '1', quantity: 0.012 }, 
      { ingredientId: '7', quantity: 0.010 }, // Guayaba
      { ingredientId: '2', quantity: 0.018 },
    ],
    packagingRecipe: [{ ingredientId: 'pkg6', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },

  // --- EMPANADAS ---
  {
    id: 'p5', name: 'Empanada Operada (Carne)', presentation: 'Paquete x5', unitsPerPack: 5,
    unitsPerHour: 60, batchSize: 100, targetMargin: 45,
    recipe: [
      { ingredientId: '2', quantity: 0.050 }, 
      { ingredientId: '5', quantity: 0.040 }, // Meat
      { ingredientId: '4', quantity: 0.010 }, // Oil
    ],
    packagingRecipe: [{ ingredientId: 'pkg1', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },
  {
    id: 'p6', name: 'Empanada Operada (Pollo)', presentation: 'Paquete x5', unitsPerPack: 5,
    unitsPerHour: 60, batchSize: 100, targetMargin: 45,
    recipe: [
      { ingredientId: '2', quantity: 0.050 }, 
      { ingredientId: '6', quantity: 0.040 }, // Chicken
      { ingredientId: '4', quantity: 0.010 },
    ],
    packagingRecipe: [{ ingredientId: 'pkg1', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },

  // --- PASTELITOS ---
  {
    id: 'p7', name: 'Pastelito Andino', presentation: 'Bolsa x10', unitsPerPack: 10,
    unitsPerHour: 90, batchSize: 150, targetMargin: 35,
    recipe: [
      { ingredientId: '2', quantity: 0.035 }, 
      { ingredientId: '5', quantity: 0.025 }, 
      { ingredientId: '4', quantity: 0.005 },
    ],
    packagingRecipe: [{ ingredientId: 'pkg1', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  },

  // --- MANDOCAS ---
  {
    id: 'p8', name: 'Mandocas Zulianas', presentation: 'Bolsa x20', unitsPerPack: 20,
    unitsPerHour: 140, batchSize: 300, targetMargin: 40,
    recipe: [
      { ingredientId: '8', quantity: 0.025 }, // Plantain
      { ingredientId: '2', quantity: 0.015 }, // Flour
      { ingredientId: '9', quantity: 0.010 }, // Panela
      { ingredientId: '1', quantity: 0.010 }, // Cheese
    ],
    packagingRecipe: [{ ingredientId: 'pkg1', quantity: 1 }, { ingredientId: 'pkg5', quantity: 1 }]
  }
];

export const INITIAL_DATA: AppData = {
  ingredients: [...DEFAULT_INGREDIENTS],
  products: [...DEFAULT_PRODUCTS],
};
