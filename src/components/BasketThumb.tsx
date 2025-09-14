import React from 'react';

const basketItems = [
  { icon: "🍞" }, { icon: "👕" }, { icon: "📱" },
  { icon: "⛽" }, { icon: "🪑" }, { icon: "🚗" },
  { icon: "💊" }, { icon: "🧵" }, { icon: "📦" },
];

type Props = {
  className?: string;
};

export default function BasketThumb({ className = "" }: Props) {
  return (
    <div className={`relative w-full h-full ${className}`}>
        <div
          className="grid grid-cols-3 gap-4 p-6 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10"
        >
          {basketItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center text-4xl bg-white/5 rounded-lg aspect-square
                         hover:bg-sky-500/20 transition-colors duration-300"
            >
              {item.icon}
            </div>
          ))}
        </div>
    </div>
  );
}
