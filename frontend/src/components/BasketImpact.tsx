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
    basePrice: 250, 
    tariff: 5,
    description: "Grocery items, fresh produce, packaged foods"
  },
  { 
    id: "clothing", 
    label: "Clothing", 
    icon: "👕", 
    basePrice: 120, 
    tariff: 8,
    description: "Apparel, shoes, accessories"
  },
  { 
    id: "electronics", 
    label: "Electronics", 
    icon: "📱", 
    basePrice: 300, 
    tariff: 12,
    description: "Smartphones, computers, home electronics"
  },
  { 
    id: "fuel", 
    label: "Fuel", 
    icon: "⛽", 
    basePrice: 180, 
    tariff: 15,
    description: "Gasoline, heating oil, energy costs"
  },
  { 
    id: "furniture", 
    label: "Furniture", 
    icon: "🪑", 
    basePrice: 150, 
    tariff: 6,
    description: "Home furniture, decor, household items"
  },
  { 
    id: "vehicles", 
    label: "Vehicles", 
    icon: "🚗", 
    basePrice: 400, 
    tariff: 10,
    description: "Cars, trucks, automotive parts"
  },
  { 
    id: "pharmaceuticals", 
    label: "Medicine", 
    icon: "💊", 
    basePrice: 100, 
    tariff: 3,
    description: "Prescription drugs, medical supplies"
  },
  { 
    id: "textiles", 
    label: "Textiles", 
    icon: "🧵", 
    basePrice: 80, 
    tariff: 9,
    description: "Fabrics, linens, home textiles"
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Consumer Basket Impact
        </h2>
        <p className="text-gray-600 text-lg">
          How tariffs affect household spending
        </p>
      </div>

      {/* Running Total */}
      <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
        <div className="text-sm text-gray-600 mb-1">Monthly Basket Cost</div>
        <div 
          className="text-4xl font-bold text-blue-600 transition-all duration-500 ease-out"
          key={totalCost} // Force re-render for animation
        >
          {formatCurrency(totalCost)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {tariffShift > 0 && (
            <span className="text-red-600">
              +{formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))} 
              due to tariffs
            </span>
          )}
        </div>
      </div>

      {/* Basket Items */}
      <div className="relative">
        {/* Basket Outline */}
        <div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-3xl opacity-30"></div>
        
        <div className="relative p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${colorClass}`}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="font-semibold text-sm mb-1">{item.label}</div>
                      <div className="text-xs opacity-75">
                        {formatCurrency(adjustedPrice)}
                      </div>
                      <div className="text-xs mt-1 font-medium">
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
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <div className="text-center mb-4">
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Simulate Tariff Increase: +{tariffShift.toFixed(1)}%
          </label>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>No tariffs</span>
            <span className="text-red-600">High tariffs</span>
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-center">
              <div className="text-red-800 font-semibold">
                Tariff Impact Summary
              </div>
              <div className="text-red-600 text-sm mt-1">
                Average household pays {formatCurrency(totalCost - basketItems.reduce((sum, item) => sum + item.basePrice, 0))} 
                extra per month with {tariffShift.toFixed(1)}% additional tariffs
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>Low tariffs (&lt;5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
          <span>Medium tariffs (5-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-300 border border-orange-400 rounded"></div>
          <span>High tariffs (10-15%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
          <span>Very high tariffs (&gt;15%)</span>
        </div>
      </div>
    </div>
  );
};

export default BasketImpact;
