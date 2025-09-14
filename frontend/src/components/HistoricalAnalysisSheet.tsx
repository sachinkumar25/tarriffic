"use client";
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TariffDataPoint } from '@/lib/tradeData';

interface HistoricalAnalysisSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoint: TariffDataPoint | null;
}

const HistoricalAnalysisSheet: React.FC<HistoricalAnalysisSheetProps> = ({
  isOpen,
  onClose,
  dataPoint,
}) => {
  if (!isOpen || !dataPoint) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="p-0 w-[500px] bg-black/90 backdrop-blur-sm border-l border-white/20 overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>US Tariff Analysis for {dataPoint.year}</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              📊 US Tariffs in {dataPoint.year}
            </h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tariff Overview Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 mb-6 border border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  📈 {dataPoint.rate.toFixed(2)}%
                </div>
                <div className="text-white/70 text-sm font-medium">Tariff Rate</div>
                <div className="text-white/50 text-xs mt-1">
                  {getTariffLevel(dataPoint.rate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  🗓️ {dataPoint.year}
                </div>
                <div className="text-white/70 text-sm font-medium">Historical Year</div>
                <div className="text-white/50 text-xs mt-1">
                  {getHistoricalEra(dataPoint.year)}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">🏛️ Historical Period:</span>
                <span className="text-blue-300 font-medium">
                  {getHistoricalEra(dataPoint.year)}
                </span>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {getEraDescription(dataPoint.year)}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">📊 Trade Policy:</span>
                <span className="text-green-400 font-medium">
                  {getTradePolicyType(dataPoint.rate)}
                </span>
              </div>
              <div className="text-white/50 text-xs mt-1">
                {getPolicyDescription(dataPoint.rate)}
              </div>
            </div>

            {/* Economic Impact Indicators - Integrated */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                💡 Economic Impact Indicators
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    🏭 Industrial Protection:
                  </span>
                  <span className="text-white font-medium">
                    {getProtectionLevel(dataPoint.rate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    💰 Revenue Generation:
                  </span>
                  <span className="text-white font-medium">
                    {getRevenueLevel(dataPoint.rate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm flex items-center gap-2">
                    🌍 Trade Openness:
                  </span>
                  <span className="text-white font-medium">
                    {getTradeOpenness(dataPoint.rate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Analysis Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📚 Historical Context</h3>
            <div className="bg-white/5 rounded-lg p-4">
              {dataPoint.analysis ? (
                <div className="text-white/90 leading-relaxed">
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: dataPoint.analysis
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="text-blue-300">$1</em>')
                        .replace(/\n- /g, '<br/>• ')
                        .replace(/\n\n/g, '</p><p class="mt-3">')
                        .replace(/\n/g, '<br/>')
                        .replace(/^/, '<p>')
                        .replace(/$/, '</p>')
                    }}
                  />
                </div>
              ) : (
                <div className="text-white/70 italic">
                  📖 No detailed historical analysis available for {dataPoint.year}.
                </div>
              )}
            </div>
          </div>

          {/* Navigation hint */}
          <div className="text-xs text-white/50 text-center bg-white/5 rounded-lg p-3">
            💡 Click on other data points in the chart to explore different historical periods
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper functions
const getHistoricalEra = (year: number): string => {
  if (year >= 2020) return 'Modern Era';
  if (year >= 1990) return 'Globalization Era';
  if (year >= 1945) return 'Post-War Era';
  if (year >= 1930) return 'Great Depression & WWII';
  if (year >= 1900) return 'Progressive Era';
  if (year >= 1870) return 'Gilded Age';
  if (year >= 1840) return 'Industrial Revolution';
  return 'Early Republic';
};

const getTariffLevel = (rate: number): string => {
  if (rate >= 40) return 'Extremely High';
  if (rate >= 25) return 'Very High';
  if (rate >= 15) return 'High';
  if (rate >= 8) return 'Moderate';
  if (rate >= 3) return 'Low';
  return 'Very Low';
};

const getEraDescription = (year: number): string => {
  if (year >= 2020) return 'Digital trade and global supply chains';
  if (year >= 1990) return 'Free trade agreements and WTO era';
  if (year >= 1945) return 'Bretton Woods system and reconstruction';
  if (year >= 1930) return 'Economic crisis and world war period';
  if (year >= 1900) return 'Antitrust and economic reforms';
  if (year >= 1870) return 'Rapid industrialization and wealth accumulation';
  if (year >= 1840) return 'Steam power and factory system expansion';
  return 'Nation-building and early economic development';
};

const getTradePolicyType = (rate: number): string => {
  if (rate >= 30) return 'Protectionist';
  if (rate >= 15) return 'Nationalist';
  if (rate >= 8) return 'Balanced';
  if (rate >= 3) return 'Liberal';
  return 'Free Trade';
};

const getPolicyDescription = (rate: number): string => {
  if (rate >= 30) return 'High barriers to protect domestic industries';
  if (rate >= 15) return 'Moderate protection with revenue focus';
  if (rate >= 8) return 'Balanced approach to trade and protection';
  if (rate >= 3) return 'Open trade with minimal barriers';
  return 'Nearly unrestricted international trade';
};

const getProtectionLevel = (rate: number): string => {
  if (rate >= 25) return 'Very High';
  if (rate >= 15) return 'High';
  if (rate >= 8) return 'Moderate';
  if (rate >= 3) return 'Low';
  return 'Minimal';
};

const getRevenueLevel = (rate: number): string => {
  if (rate >= 25) return 'Primary Source';
  if (rate >= 15) return 'Major Source';
  if (rate >= 8) return 'Significant';
  if (rate >= 3) return 'Supplementary';
  return 'Minimal';
};

const getTradeOpenness = (rate: number): string => {
  if (rate >= 25) return 'Closed';
  if (rate >= 15) return 'Restricted';
  if (rate >= 8) return 'Selective';
  if (rate >= 3) return 'Open';
  return 'Very Open';
};

export default HistoricalAnalysisSheet;
