import { GoogleGenAI } from "@google/genai";
import { Product, Ingredient, CostBreakdown } from "../types";
import { formatCurrency } from "../constants";

const getClient = () => {
    // API key must be strictly from environment variable as per security guidelines.
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
}

export const analyzeProductCosts = async (
  product: Product,
  breakdown: CostBreakdown,
  ingredients: Ingredient[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "El asistente de IA no está disponible (API Key no configurada en el entorno).";

  const prompt = `
    Actúa como un experto ingeniero de costos y alimentos para la fábrica "Umami Fénix" en Colombia.
    Analiza este producto:
    
    PRODUCTO: ${product.name}
    PRESENTACIÓN: ${product.presentation}
    UNIDADES/PACK: ${product.unitsPerPack}
    
    METRICAS FINANCIERAS ACTUALES (Moneda: Pesos Colombianos COP):
    - Costo Materia Prima (Pack): ${formatCurrency(breakdown.rawMaterialCost)}
    - Costo Empaque (Pack): ${formatCurrency(breakdown.packagingCost)}
    - Costo Mano de Obra (Pack): ${formatCurrency(breakdown.laborCost)}
    - Costo TOTAL (Pack): ${formatCurrency(breakdown.totalPackCost)}
    - Costo Unitario Real: ${formatCurrency(breakdown.totalUnitCost)}
    - Precio Sugerido (al público): ${formatCurrency(breakdown.suggestedPrice)}
    - Margen Actual: ${product.targetMargin}%
    
    INSUMOS DISPONIBLES EN BASE DE DATOS (Muestra):
    ${ingredients.slice(0, 15).map(i => `- ${i.name}: ${formatCurrency(i.cost)}/${i.unit}`).join('\n')}
    
    TAREA:
    Dame un análisis breve (máximo 150 palabras) con:
    1. Una observación sobre la rentabilidad actual considerando el mercado colombiano de alimentos congelados.
    2. Dos sugerencias concretas para reducir costos sin bajar calidad.
    
    Responde en formato Markdown limpio. Usa formato de pesos colombianos ($ X.XXX).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error temporal al conectar con el servicio de IA.";
  }
};