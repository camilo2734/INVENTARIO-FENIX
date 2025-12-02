import React, { useState, useEffect } from 'react';
import { AppData, Product, Ingredient } from './types';
import { INITIAL_DATA } from './constants';
import { loadAppData, saveAppData, resetData } from './services/storageService';
import { ProductsView } from './components/ProductsView';
import { IngredientsView } from './components/IngredientsView';
import { CalculatorView } from './components/CalculatorView';
import { LayoutDashboard, ShoppingBag, Calculator, History, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeView, setActiveView] = useState<'products' | 'ingredients' | 'calculator'>('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loaded = loadAppData();
    if (loaded) setData(loaded);
  }, []);

  // Auto-save on change
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const updateIngredients = (newIngredients: Ingredient[]) => {
    setData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const updateProducts = (newProducts: Product[]) => {
    setData(prev => ({ ...prev, products: newProducts }));
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('calculator');
    // On mobile, close sidebar
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    const newProducts = data.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setData(prev => ({ ...prev, products: newProducts }));
    setSelectedProduct(updatedProduct);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'ingredients':
        return <IngredientsView ingredients={data.ingredients} setIngredients={updateIngredients} />;
      case 'calculator':
        if (selectedProduct) {
          return (
            <CalculatorView 
              product={selectedProduct} 
              ingredients={data.ingredients} 
              onUpdateProduct={handleProductUpdate}
              onBack={() => {
                setActiveView('products');
                setSelectedProduct(null);
              }}
            />
          );
        }
        return <div className="p-8 text-center text-slate-500">Selecciona un producto para calcular costos.</div>;
      case 'products':
      default:
        return (
          <ProductsView 
            products={data.products} 
            ingredients={data.ingredients}
            setProducts={updateProducts}
            onSelectProduct={handleProductSelect}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md text-slate-600"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Umami Fénix
              </h1>
              <p className="text-xs text-slate-400 font-medium">Calculadora de Costos</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setActiveView('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'products' && !selectedProduct ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={20} />
              Productos
            </button>
            <button 
              onClick={() => setActiveView('ingredients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'ingredients' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ShoppingBag size={20} />
              Insumos
            </button>
            <button 
               onClick={() => { if(selectedProduct) setActiveView('calculator'); else setActiveView('products'); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'calculator' ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Calculator size={20} />
              Calculadora
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100">
             <button 
              onClick={() => { if(confirm('¿Reiniciar todos los datos a fábrica?')) resetData(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
            >
              Restablecer Datos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;