"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

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

  // Calculate total cost whenever tariff shift changes
  useEffect(() => {
    const total = basketItems.reduce((sum, item) => {
      const adjustedTariff = item.tariff + tariffShift;
      const adjustedPrice = item.basePrice * (1 + adjustedTariff / 100);
      return sum + adjustedPrice;
    }, 0);
    setTotalCost(total);
  }, [tariffShift]);

  // Get color class based on tariff level
  const getTariffColor = (tariff: number) => {
    const adjustedTariff = tariff + tariffShift;
    if (adjustedTariff < 5) return 'bg-green-100 text-green-800 border-green-200';
    if (adjustedTariff < 10) return 'bg-yellow-200 text-yellow-800 border-yellow-300';
    if (adjustedTariff < 15) return 'bg-orange-300 text-orange-800 border-orange-400';
    return 'bg-red-500 text-white border-red-600';
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Consumer Basket Impact
        </h2>
        <p className="text-gray-700 text-xl font-medium mb-2">
          How tariffs affect household spending
        </p>
        <p className="text-gray-600 text-base">
          Based on CPI-style normalized weights reflecting real household spending patterns
        </p>
      </div>

      {/* Running Total */}
      <div className="text-center mb-8 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 shadow-lg">
        <div className="text-lg text-gray-700 mb-2 font-medium">Monthly Basket Cost</div>
        <div 
          className="text-5xl font-bold text-blue-600 transition-all duration-700 ease-out"
          key={totalCost} // Force re-render for animation
        >
          {formatCurrency(totalCost)}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          {tariffShift > 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-red-600 font-semibold">
                +{formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))} 
                due to tariffs
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Base household spending</span>
          )}
        </div>
      </div>

      {/* Basket Items */}
      <div className="relative">
        {/* Basket Outline */}
        <div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-3xl opacity-30"></div>
        
        <div className="relative p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {basketItems.map((item) => {
              const adjustedTariff = item.tariff + tariffShift;
              const adjustedPrice = getAdjustedPrice(item);
              const colorClass = getTariffColor(item.tariff);
              
              return (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Item Card */}
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md ${colorClass}`}>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                        {item.icon}
                      </div>
                      <div className="font-semibold text-sm mb-1">{item.label}</div>
                      <div className="text-xs opacity-90 font-medium">
                        {formatCurrency(adjustedPrice)}
                      </div>
                      <div className="text-xs mt-1 font-bold">
                        {adjustedTariff.toFixed(1)}% tariff
                      </div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  {hoveredItem === item.id && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white rounded-lg shadow-lg text-sm">
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
      </div>

      {/* Tariff Simulation Slider */}
      <div className="mt-8 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 shadow-lg">
        <div className="text-center mb-6">
          <label className="block text-xl font-bold text-gray-800 mb-2">
            Simulate Tariff Increase: +{tariffShift.toFixed(1)}%
          </label>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              No tariffs
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              High tariffs
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
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Impact Summary */}
        {tariffShift > 0 && (
          <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl shadow-md">
            <div className="text-center">
              <div className="text-red-800 font-bold text-lg mb-2">
                💰 Tariff Impact Summary
              </div>
              <div className="text-red-700 text-base font-medium">
                Average household pays <span className="font-bold">{formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))}</span> 
                extra per month with {tariffShift.toFixed(1)}% additional tariffs
              </div>
              <div className="text-red-600 text-sm mt-2">
                That's {formatCurrency((totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0)) * 12)} per year in additional costs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Tariff Impact Levels</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
              <span className="text-green-700 text-xs font-bold">✅</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Low tariffs</div>
              <div className="text-gray-600 text-xs">&lt;5%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-200 border border-yellow-300 rounded-full flex items-center justify-center">
              <span className="text-yellow-700 text-xs font-bold">🟨</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Medium tariffs</div>
              <div className="text-gray-600 text-xs">5-10%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-300 border border-orange-400 rounded-full flex items-center justify-center">
              <span className="text-orange-700 text-xs font-bold">🟧</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">High tariffs</div>
              <div className="text-gray-600 text-xs">10-15%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 border border-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">🟥</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Very high tariffs</div>
              <div className="text-gray-600 text-xs">&gt;15%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketImpact;
