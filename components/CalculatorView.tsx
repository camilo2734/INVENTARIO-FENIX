import React, { useState, useMemo } from 'react';
import { Product, Ingredient, RecipeItem, CostBreakdown } from '../types';
import { calculateProductCost } from '../services/calculationService';
import { analyzeProductCosts } from '../services/geminiService';
import { generateCostPDF } from '../services/pdfService';
import { Card } from './ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, Plus, AlertCircle, Sparkles, Zap, TrendingUp, Download } from 'lucide-react';
import { formatCurrency } from '../constants';

interface Props {
  product: Product;
  ingredients: Ingredient[];
  onUpdateProduct: (p: Product) => void;
  onBack: () => void;
}

export const CalculatorView: React.FC<Props> = ({ product, ingredients, onUpdateProduct, onBack }) => {
  const [activeTab, setActiveTab] = useState<'recipe' | 'packaging' | 'settings'>('recipe');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Real-time calculation: Updates immediately when product or ingredients change
  const breakdown: CostBreakdown = useMemo(() => {
    return calculateProductCost(product, ingredients);
  }, [product, ingredients]);

  const handleRecipeChange = (itemIdx: number, field: keyof RecipeItem, value: any, isPackaging = false) => {
    const listKey = isPackaging ? 'packagingRecipe' : 'recipe';
    const newList = [...product[listKey]];
    newList[itemIdx] = { ...newList[itemIdx], [field]: value };
    onUpdateProduct({ ...product, [listKey]: newList });
  };

  const addIngredient = (isPackaging = false) => {
    const listKey = isPackaging ? 'packagingRecipe' : 'recipe';
    const catFilter = isPackaging ? 'packaging' : 'raw';
    // Prioritize showing relevant ingredients
    const defaultIng = ingredients.find(i => i.category === catFilter) || ingredients[0];
    
    onUpdateProduct({
      ...product,
      [listKey]: [...product[listKey], { ingredientId: defaultIng.id, quantity: 1 }]
    });
  };

  const removeIngredient = (idx: number, isPackaging = false) => {
    const listKey = isPackaging ? 'packagingRecipe' : 'recipe';
    const newList = [...product[listKey]];
    newList.splice(idx, 1);
    onUpdateProduct({ ...product, [listKey]: newList });
  };

  const handleGetAdvice = async () => {
    setLoadingAi(true);
    const advice = await analyzeProductCosts(product, breakdown, ingredients);
    setAiAdvice(advice);
    setLoadingAi(false);
  }

  // Chart Data
  const chartData = [
    { name: 'Materia Prima', value: breakdown.rawMaterialCost, color: '#f97316' }, // Orange 500
    { name: 'Empaque', value: breakdown.packagingCost, color: '#6366f1' }, // Indigo 500
    { name: 'Mano de Obra', value: breakdown.laborCost, color: '#10b981' }, // Emerald 500
    { name: 'Servicios', value: breakdown.energyCost, color: '#ef4444' }, // Red 500
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-none">{product.name}</h1>
          <span className="text-sm text-slate-500 font-medium inline-block mt-1">{product.presentation} • {product.unitsPerPack} unds</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex p-1 bg-slate-200/60 rounded-xl w-full md:w-fit overflow-x-auto">
            <button 
              onClick={() => setActiveTab('recipe')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'recipe' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Receta (1 Unid.)
            </button>
            <button 
               onClick={() => setActiveTab('packaging')}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'packaging' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Empaque (Lote)
            </button>
            <button 
               onClick={() => setActiveTab('settings')}
               className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Configuración
            </button>
          </div>

          <Card className="min-h-[400px]">
            {activeTab === 'recipe' && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">Ingredientes Unitarios</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Cantidades para 1 unidad</span>
                 </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-3 pl-2">Ingrediente</th>
                        <th className="text-left py-3 w-32">Cantidad</th>
                        <th className="text-right py-3 w-32">Costo (COP)</th>
                        <th className="py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {product.recipe.map((item, idx) => {
                        const ing = ingredients.find(i => i.id === item.ingredientId);
                        return (
                          <tr key={idx} className="group hover:bg-slate-50">
                            <td className="py-2 pl-2">
                              <select 
                                className="w-full bg-transparent border-none focus:ring-0 p-1 font-medium text-slate-700"
                                value={item.ingredientId}
                                onChange={(e) => handleRecipeChange(idx, 'ingredientId', e.target.value)}
                              >
                                {ingredients.filter(i => i.category === 'raw' || i.category === 'energy').sort((a,b) => a.name.localeCompare(b.name)).map(i => (
                                  <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-orange-200">
                                <input 
                                  type="number" 
                                  className="w-full bg-transparent border-none p-0 text-right outline-none font-medium"
                                  value={item.quantity}
                                  onChange={(e) => handleRecipeChange(idx, 'quantity', parseFloat(e.target.value))}
                                  step="0.001"
                                />
                                <span className="text-slate-400 text-xs shrink-0 w-8 text-right">{ing?.unit}</span>
                              </div>
                            </td>
                            <td className="py-2 text-right text-slate-600 font-medium">
                              {formatCurrency((ing?.cost || 0) * item.quantity)}
                            </td>
                            <td className="text-center">
                               <button onClick={() => removeIngredient(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><AlertCircle size={18} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button onClick={() => addIngredient(false)} className="mt-4 w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-medium flex items-center justify-center gap-2 hover:border-orange-300 hover:text-orange-600 transition-colors">
                  <Plus size={18} /> Agregar Ingrediente
                </button>
              </div>
            )}

            {activeTab === 'packaging' && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">Material de Empaque</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Cantidades por PAQUETE completo</span>
                 </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 font-medium border-b border-slate-100 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="text-left py-3 pl-2">Material</th>
                        <th className="text-left py-3 w-32">Cantidad</th>
                        <th className="text-right py-3 w-32">Costo (COP)</th>
                        <th className="py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {product.packagingRecipe.map((item, idx) => {
                        const ing = ingredients.find(i => i.id === item.ingredientId);
                        return (
                          <tr key={idx} className="group hover:bg-slate-50">
                            <td className="py-2 pl-2">
                               <select 
                                className="w-full bg-transparent border-none focus:ring-0 p-1 font-medium text-slate-700"
                                value={item.ingredientId}
                                onChange={(e) => handleRecipeChange(idx, 'ingredientId', e.target.value, true)}
                              >
                                {ingredients.filter(i => i.category === 'packaging').map(i => (
                                  <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-orange-200">
                                <input 
                                  type="number" 
                                  className="w-full bg-transparent border-none p-0 text-right outline-none font-medium"
                                  value={item.quantity}
                                  onChange={(e) => handleRecipeChange(idx, 'quantity', parseFloat(e.target.value), true)}
                                />
                                <span className="text-slate-400 text-xs shrink-0 w-8 text-right">{ing?.unit}</span>
                              </div>
                            </td>
                            <td className="py-2 text-right text-slate-600 font-medium">
                              {formatCurrency((ing?.cost || 0) * item.quantity)}
                            </td>
                            <td className="text-center">
                               <button onClick={() => removeIngredient(idx, true)} className="text-slate-300 hover:text-red-500 transition-colors"><AlertCircle size={18} /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                 <button onClick={() => addIngredient(true)} className="mt-4 w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-medium flex items-center justify-center gap-2 hover:border-orange-300 hover:text-orange-600 transition-colors">
                  <Plus size={18} /> Agregar Material
                </button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Nombre Producto</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-all" value={product.name} onChange={e => onUpdateProduct({...product, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Presentación</label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-all" value={product.presentation} onChange={e => onUpdateProduct({...product, presentation: e.target.value})} />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Zap size={18} className="text-orange-500" />
                    Eficiencia de Producción
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs text-slate-500 mb-1">Unidades por Paquete</label>
                      <input type="number" className="w-full border border-slate-200 rounded-md p-2" value={product.unitsPerPack} onChange={e => onUpdateProduct({...product, unitsPerPack: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Unidades / Hora (Labor)</label>
                      <input type="number" className="w-full border border-slate-200 rounded-md p-2" value={product.unitsPerHour} onChange={e => onUpdateProduct({...product, unitsPerHour: parseFloat(e.target.value)})} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-slate-700">Unidades Individuales por Sesión de Producción</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 100 deditos/piezas (NO paquetes)"
                        className="w-full border border-slate-200 rounded-md p-2" 
                        value={product.batchSize} 
                        onChange={e => onUpdateProduct({...product, batchSize: parseFloat(e.target.value)})} 
                      />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        ¿Cuántas UNIDADES INDIVIDUALES (deditos, empanadas, etc) produces en una sesión de trabajo? Este número se usa para dividir el costo de gas/electricidad. Ejemplo: si produces 100 deditos y gastas $5.000 en gas = $50 por dedito.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex gap-2 items-start mt-2">
                         <span className="shrink-0 text-base">💡</span>
                         <p>
                           <strong>Importante:</strong> Ingresa unidades INDIVIDUALES producidas, no paquetes. Si produces 100 deditos que luego empacarás en bandejas de 6, ingresas 100 (no 16 paquetes).
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: RESULTS */}
        <div className="space-y-6">
          
          {/* Main Result Card */}
          <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={120} />
            </div>
            
            <div className="p-6 relative z-10">
               <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-6">Resultado Financiero</h3>
               
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                       <p className="text-slate-400 text-sm mb-1">Costo Producción</p>
                       <p className="text-2xl font-semibold">{formatCurrency(breakdown.totalPackCost)}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-slate-400 text-sm mb-1">Ganancia Neta</p>
                       <p className="text-2xl font-semibold text-green-400">+{formatCurrency(breakdown.profit)}</p>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700">
                    <p className="text-center text-slate-400 text-sm mb-2">Precio Sugerido de Venta</p>
                    <div className="text-center">
                      <span className="text-4xl md:text-5xl font-bold tracking-tight">{formatCurrency(breakdown.suggestedPrice)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-4 mt-4">
                    <label className="flex justify-between text-sm mb-2">
                       <span className="text-slate-300">Margen de Ganancia</span>
                       <span className="font-bold text-orange-400">{product.targetMargin}%</span>
                    </label>
                    <input 
                      type="range" min="5" max="80" step="5" 
                      value={product.targetMargin} 
                      onChange={(e) => onUpdateProduct({...product, targetMargin: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <button 
                    onClick={() => generateCostPDF(product, breakdown, ingredients)}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-900/20"
                  >
                    <Download size={20} />
                    Descargar PDF
                  </button>
               </div>
            </div>
          </div>

          {/* Breakdown Chart */}
          <Card title="Distribución de Costos">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => formatCurrency(val)} 
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-slate-400 text-xs">Total</span>
                <span className="text-slate-800 font-bold">{formatCurrency(breakdown.totalPackCost)}</span>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex justify-between items-center text-sm group">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }}></span>
                    <span className="text-slate-600 group-hover:text-slate-900 transition-colors">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-xs">{((d.value / breakdown.totalPackCost) * 100).toFixed(0)}%</span>
                    <span className="font-semibold text-slate-800 w-24 text-right">{formatCurrency(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Advisor */}
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                 <Sparkles size={20} />
               </div>
               <div className="flex-1">
                 <h3 className="font-bold text-indigo-900">Asistente Inteligente</h3>
                 <p className="text-xs text-indigo-600/80 mb-3">Obtén consejos para optimizar este producto.</p>
                 
                 {aiAdvice ? (
                   <div className="text-sm text-slate-700 bg-white/60 p-3 rounded-lg border border-indigo-100 prose prose-sm max-w-none">
                     <div dangerouslySetInnerHTML={{ __html: aiAdvice.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                     <button onClick={() => setAiAdvice('')} className="text-xs text-indigo-500 mt-2 underline">Limpiar</button>
                   </div>
                 ) : (
                   <button 
                    onClick={handleGetAdvice}
                    disabled={loadingAi}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm shadow-indigo-200"
                   >
                     {loadingAi ? 'Analizando...' : 'Analizar Rentabilidad'}
                   </button>
                 )}
               </div>
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
};