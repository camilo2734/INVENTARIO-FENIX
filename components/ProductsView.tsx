import React, { useState } from 'react';
import { Product, Ingredient } from '../types';
import { Card } from './ui/Card';
import { Plus, Trash2, Package, Settings } from 'lucide-react';
import { formatCurrency } from '../constants';

interface Props {
  products: Product[];
  ingredients: Ingredient[];
  setProducts: (p: Product[]) => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductsView: React.FC<Props> = ({ products, ingredients, setProducts, onSelectProduct }) => {

  const handleDuplicate = (p: Product) => {
    const newProduct = {
      ...p,
      id: Date.now().toString(),
      name: `${p.name} (Copia)`,
    };
    setProducts([...products, newProduct]);
  };

  const handleDelete = (id: string) => {
    if(confirm('¿Eliminar producto?')) setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h2>
          <p className="text-slate-500">Administra las presentaciones y recetas.</p>
        </div>
        <button 
          onClick={() => handleDuplicate(products[0])} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-shadow group relative">
             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDuplicate(product)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600" title="Duplicar"
                >
                  <Plus size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-50 rounded-full hover:bg-red-100 text-red-500" title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
             </div>

            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                   <Package size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{product.name}</h3>
                   <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                     {product.presentation}
                   </span>
                 </div>
               </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span>Unidades / Paquete:</span>
                 <span className="font-medium text-slate-900">{product.unitsPerPack}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                 <span>M.O. x Paquete:</span>
                 <span className="font-medium text-slate-900">{formatCurrency(product.laborCostPerPack || 0)}</span>
              </div>
              <div className="flex justify-between">
                 <span>Margen Objetivo:</span>
                 <span className="font-medium text-green-600">{product.targetMargin}%</span>
              </div>
            </div>

            <button 
              onClick={() => onSelectProduct(product)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all font-medium"
            >
              <Settings size={16} /> Configurar Receta
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};