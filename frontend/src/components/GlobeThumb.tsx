// src/components/GlobeThumb.tsx

import React from 'react';

export default function GlobeThumb({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-gray-900/50 to-indigo-900/50 rounded-2xl border border-white/10 shadow-2xl">
        {/* Globe Sphere */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.15)_0%,rgba(147,197,253,0)_60%)] animate-pulse" />
        </div>
        
        {/* Continents */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200">
          <path d="M 100 10 C 120 10, 140 20, 150 40 S 160 80, 140 100 S 100 120, 80 110 S 50 90, 40 70 S 60 10, 100 10 Z" fill="rgba(255,255,255,0.2)" />
          <path d="M 50 120 C 60 140, 80 150, 100 150 S 140 140, 150 120 S 130 100, 100 100 S 70 100, 50 120 Z" fill="rgba(255,255,255,0.15)" />
          <path d="M 20 80 C 30 100, 50 110, 60 100 S 50 80, 40 70 S 10 60, 20 80 Z" fill="rgba(255,255,255,0.1)" />
        </svg>

        {/* Animated Arcs */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="arc-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="arc-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0" />
              <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Arc 1 */}
          <path
            d="M 50 50 Q 100 0, 150 50"
            fill="none"
            stroke="url(#arc-gradient-1)"
            strokeWidth="2"
            strokeDasharray="200"
            strokeDashoffset="200"
            className="animate-flow"
            style={{ animationDelay: '0s' }}
          />

          {/* Arc 2 */}
          <path
            d="M 30 100 Q 100 180, 170 100"
            fill="none"
            stroke="url(#arc-gradient-2)"
            strokeWidth="2.5"
            strokeDasharray="250"
            strokeDashoffset="250"
            className="animate-flow"
            style={{ animationDelay: '0.5s' }}
          />

           {/* Arc 3 */}
          <path
            d="M 160 40 Q 50 100, 150 150"
            fill="none"
            stroke="url(#arc-gradient-1)"
            strokeWidth="1.5"
            strokeDasharray="220"
            strokeDashoffset="220"
            className="animate-flow"
            style={{ animationDelay: '1s' }}
          />
        </svg>

        <style jsx>{`
          @keyframes flow {
            to {
              stroke-dashoffset: -200;
            }
          }
          .animate-flow {
            animation: flow 3s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
