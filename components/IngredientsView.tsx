import React, { useState } from 'react';
import { Ingredient, UnitType } from '../types';
import { Card } from './ui/Card';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { formatCurrency } from '../constants';

interface Props {
  ingredients: Ingredient[];
  setIngredients: (i: Ingredient[]) => void;
}

export const IngredientsView: React.FC<Props> = ({ ingredients, setIngredients }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    cost: 0,
    unit: UnitType.KG,
    category: 'raw'
  });

  const handleUpdate = (id: string, field: keyof Ingredient, value: any) => {
    const updated = ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    setIngredients(updated);
  };

  const handleCostChange = (id: string, value: string) => {
    const floatVal = parseFloat(value);
    handleUpdate(id, 'cost', isNaN(floatVal) ? 0 : floatVal);
  };

  const handleAdd = () => {
    if (!newIngredient.name) return;
    const id = Date.now().toString();
    setIngredients([...ingredients, { ...newIngredient, id } as Ingredient]);
    setIsAdding(false);
    setNewIngredient({ name: '', cost: 0, unit: UnitType.KG, category: 'raw' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel de Insumos</h2>
          <p className="text-slate-500">Gestiona los precios de materia prima y empaque.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nuevo Insumo
        </button>
      </div>

      {isAdding && (
        <Card className="border-indigo-100 bg-indigo-50/30">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nombre</label>
              <input 
                autoFocus
                type="text" 
                placeholder="Ej. Harina Pan" 
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newIngredient.name}
                onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
              />
            </div>
            <div className="w-32">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Costo (COP)</label>
              <input 
                type="number" 
                step="100"
                className="w-full p-2 border border-slate-300 rounded-md outline-none"
                value={newIngredient.cost}
                onChange={e => setNewIngredient({...newIngredient, cost: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="w-32">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Unidad</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                value={newIngredient.unit}
                onChange={e => setNewIngredient({...newIngredient, unit: e.target.value as UnitType})}
              >
                {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
             <div className="w-40">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Categoría</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md outline-none bg-white"
                value={newIngredient.category}
                onChange={e => setNewIngredient({...newIngredient, category: e.target.value as any})}
              >
                <option value="raw">Materia Prima</option>
                <option value="packaging">Empaque</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700">
                <Save size={20} />
              </button>
              <button onClick={() => setIsAdding(false)} className="bg-slate-200 text-slate-600 p-2 rounded-md hover:bg-slate-300">
                <X size={20} />
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Group by category for cleaner look */}
        {['raw', 'packaging'].map(cat => {
           const items = ingredients.filter(i => i.category === cat);
           if (items.length === 0) return null;
           
           const catTitles: Record<string, string> = { 
             raw: 'Materia Prima', packaging: 'Empaques'
           };

           return (
             <Card key={cat} title={catTitles[cat]}>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                     <tr>
                       <th className="px-4 py-3">Nombre</th>
                       <th className="px-4 py-3 w-40">Costo (COP)</th>
                       <th className="px-4 py-3 w-24">Unidad</th>
                       <th className="px-4 py-3 w-16 text-right">Acción</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {items.map(ing => (
                       <tr key={ing.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-4 py-3 font-medium text-slate-700">
                           <input 
                              type="text" 
                              value={ing.name} 
                              onChange={(e) => handleUpdate(ing.id, 'name', e.target.value)}
                              className="bg-transparent border-none focus:ring-0 w-full font-medium p-0"
                           />
                         </td>
                         <td className="px-4 py-3">
                           <div className="relative group/input">
                             <input 
                                type="number" 
                                value={ing.cost} 
                                onChange={(e) => handleCostChange(ing.id, e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-md py-1 px-2 text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500 transition-all text-right pr-12"
                             />
                             <span className="absolute right-3 top-1.5 text-xs text-slate-400 pointer-events-none font-semibold">
                               COP
                             </span>
                           </div>
                           <div className="text-xs text-slate-400 text-right mt-1 font-medium">
                             {formatCurrency(ing.cost)}
                           </div>
                         </td>
                         <td className="px-4 py-3 text-slate-500 uppercase">{ing.unit}</td>
                         <td className="px-4 py-3 text-right">
                           <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('¿Eliminar este insumo?')) {
                                setIngredients(ingredients.filter(i => i.id !== ing.id));
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                            title="Eliminar insumo"
                           >
                             <Trash2 size={18} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </Card>
           )
        })}
      </div>
    </div>
  );
};