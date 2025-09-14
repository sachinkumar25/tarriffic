"use client";

import React, { useState, useEffect } from 'react';

interface BasketItem {
  id: string;
  label: string;
  icon: string;
  basePrice: number;
  tariff: number;
  description: string;
}

const basketItems: BasketItem[] = [
  { 
    id: "food", 
    label: "Food", 
    icon: "🍞", 
    basePrice: 150, 
    tariff: 5,
    description: "Grocery items, fresh produce, packaged foods (15% of household spending)"
  },
  { 
    id: "clothing", 
    label: "Clothing", 
    icon: "👕", 
    basePrice: 50, 
    tariff: 8,
    description: "Apparel, shoes, accessories (5% of household spending)"
  },
  { 
    id: "electronics", 
    label: "Electronics", 
    icon: "📱", 
    basePrice: 100, 
    tariff: 12,
    description: "Smartphones, computers, home electronics (10% of household spending)"
  },
  { 
    id: "fuel", 
    label: "Fuel", 
    icon: "⛽", 
    basePrice: 150, 
    tariff: 15,
    description: "Gasoline, heating oil, energy costs (15% of household spending)"
  },
  { 
    id: "furniture", 
    label: "Furniture", 
    icon: "🪑", 
    basePrice: 50, 
    tariff: 6,
    description: "Home furniture, decor, household items (5% of household spending)"
  },
  { 
    id: "vehicles", 
    label: "Vehicles", 
    icon: "🚗", 
    basePrice: 200, 
    tariff: 10,
    description: "Cars, trucks, automotive parts (20% of household spending)"
  },
  { 
    id: "pharmaceuticals", 
    label: "Medicine", 
    icon: "💊", 
    basePrice: 50, 
    tariff: 3,
    description: "Prescription drugs, medical supplies (5% of household spending)"
  },
  { 
    id: "textiles", 
    label: "Textiles", 
    icon: "🧵", 
    basePrice: 50, 
    tariff: 9,
    description: "Fabrics, linens, home textiles (5% of household spending)"
  }
];

const BasketImpact: React.FC = () => {
  const [tariffShift, setTariffShift] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  // Calculate total cost whenever tariff shift changes
  useEffect(() => {
    const total = basketItems.reduce((sum, item) => {
      const adjustedTariff = item.tariff + tariffShift;
      const adjustedPrice = item.basePrice * (1 + adjustedTariff / 100);
      return sum + adjustedPrice;
    }, 0);
    setTotalCost(total);
  }, [tariffShift]);

  // Show items progressively based on tariff shift
  useEffect(() => {
    const newVisibleItems = new Set<string>();
    const itemsToShow = Math.min(Math.floor((tariffShift / 20) * basketItems.length) + 1, basketItems.length);
    
    for (let i = 0; i < itemsToShow; i++) {
      newVisibleItems.add(basketItems[i].id);
    }
    
    setVisibleItems(newVisibleItems);
  }, [tariffShift]);

  // Get color class based on tariff level
  const getTariffColor = (tariff: number) => {
    const adjustedTariff = tariff + tariffShift;
    if (adjustedTariff < 5) return 'bg-green-100 text-green-800 border-green-200 shadow-green-200';
    if (adjustedTariff < 10) return 'bg-yellow-200 text-yellow-800 border-yellow-300 shadow-yellow-300';
    if (adjustedTariff < 15) return 'bg-orange-300 text-orange-800 border-orange-400 shadow-orange-400';
    return 'bg-red-500 text-white border-red-600 shadow-red-600';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate adjusted price for an item
  const getAdjustedPrice = (item: BasketItem) => {
    const adjustedTariff = item.tariff + tariffShift;
    return item.basePrice * (1 + adjustedTariff / 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-black/20 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-3">
          Consumer Basket Impact
        </h2>
        <p className="text-gray-300 text-xl font-medium mb-2">
          How tariffs affect household spending
        </p>
        <p className="text-gray-400 text-base">
          Based on CPI-style normalized weights reflecting real household spending patterns
        </p>
      </div>

      {/* Running Total */}
      <div className="text-center mb-8 p-8 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl border-2 border-dashed border-blue-400/30 shadow-lg">
        <div className="text-lg text-gray-300 mb-2 font-medium">Monthly Basket Cost</div>
        <div 
          className="text-4xl font-extrabold text-blue-400 transition-all duration-700 ease-out"
          key={totalCost} // Force re-render for animation
        >
          {formatCurrency(totalCost)}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          {tariffShift > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-red-400 font-semibold">
                +{formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))} 
                due to tariffs
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Base household spending</span>
          )}
        </div>
      </div>

      {/* Visual Shopping Basket */}
      <div className="relative mb-8">
        {/* Basket SVG */}
        <div className="relative mx-auto w-80 h-64 flex items-end justify-center">
          <svg 
            width="320" 
            height="240" 
            viewBox="0 0 320 240" 
            className="absolute inset-0"
          >
            {/* Basket Handle */}
            <path 
              d="M 80 60 Q 160 20 240 60" 
              stroke="#8B5CF6" 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round"
              className="opacity-60"
            />
            {/* Basket Body */}
            <rect 
              x="60" 
              y="80" 
              width="200" 
              height="140" 
              rx="10" 
              ry="10" 
              fill="none" 
              stroke="#8B5CF6" 
              strokeWidth="4" 
              strokeDasharray="8,4"
              className="opacity-40"
            />
            {/* Basket Bottom */}
            <rect 
              x="60" 
              y="200" 
              width="200" 
              height="20" 
              rx="10" 
              ry="10" 
              fill="#F3F4F6" 
              stroke="#8B5CF6" 
              strokeWidth="2"
              className="opacity-60"
            />
          </svg>
          
          {/* Animated Items in Basket */}
          <div className="relative w-80 h-64 grid grid-cols-4 gap-2 p-4">
            {basketItems.map((item, index) => {
              const adjustedTariff = item.tariff + tariffShift;
              const adjustedPrice = getAdjustedPrice(item);
              const colorClass = getTariffColor(item.tariff);
              const isVisible = visibleItems.has(item.id);
              const row = Math.floor(index / 4);
              const col = index % 4;
              
              return (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    transform: `translateY(${isVisible ? '0' : '100px'})`,
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                    transitionDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Item Card */}
                  <div className={`w-16 h-16 rounded-xl border-2 transition-all duration-500 hover:scale-110 cursor-pointer shadow-lg ${colorClass} flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-center leading-tight">
                      {adjustedTariff.toFixed(0)}%
                    </div>
                    
                    {/* Glow effect for high tariffs */}
                    {adjustedTariff > 15 && (
                      <div className="absolute inset-0 bg-red-400 opacity-20 animate-pulse rounded-xl"></div>
                    )}
                  </div>

                  {/* Item Label */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-300 text-center whitespace-nowrap">
                    {item.label}
                  </div>

                  {/* Tooltip */}
                  {hoveredItem === item.id && (
                    <div className="absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white rounded-lg shadow-xl text-sm">
                      <div className="font-semibold mb-2">{item.label}</div>
                      <div className="space-y-1 text-xs">
                        <div>{item.description}</div>
                        <div className="border-t border-gray-700 pt-1 mt-2">
                          <div>Base: {formatCurrency(item.basePrice)}</div>
                          <div>
                            Tariff: {item.tariff}% → {adjustedTariff.toFixed(1)}%
                          </div>
                          <div className="font-semibold">
                            Adjusted: {formatCurrency(adjustedPrice)}
                          </div>
                        </div>
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Basket Legend */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
            <span className="text-sm font-medium text-blue-300">
              🛒 {visibleItems.size} of {basketItems.length} items in basket
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Items appear as tariffs increase • Hover for details
          </p>
        </div>
      </div>

      {/* Tariff Simulation Slider */}
      <div className="mt-8 p-8 bg-gradient-to-r from-gray-800/30 to-blue-800/30 rounded-2xl border border-gray-600/30 shadow-lg">
        <div className="text-center mb-6">
          <label className="block text-xl font-bold text-white mb-2">
            🎛️ Simulate Tariff Increase: +{tariffShift.toFixed(1)}%
          </label>
          <p className="text-sm text-gray-300 mb-4">
            Move the slider to see items &ldquo;drop&rdquo; into the basket as tariffs increase
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 border border-green-300 rounded-full"></div>
              <span className="font-medium">No tariffs</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-medium">High tariffs</span>
            </span>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={tariffShift}
            onChange={(e) => setTariffShift(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Impact Summary */}
        {tariffShift > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/30 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-red-300 font-bold text-xl mb-3 flex items-center justify-center gap-2">
                💰 Tariff Impact Summary
              </div>
              <div className="text-red-200 text-base font-medium mb-2">
                Average household pays <span className="font-bold text-lg">{formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))}</span> 
                extra per month with {tariffShift.toFixed(1)}% additional tariffs
              </div>
              <div className="text-red-300 text-sm">
                That&apos;s <span className="font-bold">{formatCurrency((totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0)) * 12)}</span> per year in additional costs
              </div>
              <div className="mt-3 text-xs text-red-400">
                💡 {visibleItems.size} items currently affected by tariffs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-600/30 shadow-sm">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">Tariff Impact Levels</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-400 border border-green-300 rounded-full flex items-center justify-center">
              <span className="text-green-800 text-xs font-bold">✅</span>
            </div>
            <div>
              <div className="font-medium text-white">Low tariffs</div>
              <div className="text-gray-400 text-xs">&lt;5%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-400 border border-yellow-300 rounded-full flex items-center justify-center">
              <span className="text-yellow-800 text-xs font-bold">🟨</span>
            </div>
            <div>
              <div className="font-medium text-white">Medium tariffs</div>
              <div className="text-gray-400 text-xs">5-10%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-400 border border-orange-300 rounded-full flex items-center justify-center">
              <span className="text-orange-800 text-xs font-bold">🟧</span>
            </div>
            <div>
              <div className="font-medium text-white">High tariffs</div>
              <div className="text-gray-400 text-xs">10-15%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 border border-red-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🟥</span>
            </div>
            <div>
              <div className="font-medium text-white">Very high tariffs</div>
              <div className="text-gray-400 text-xs">&gt;15%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketImpact;
