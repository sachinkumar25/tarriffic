import React from 'react';

interface HeatmapLegendProps {
  metric: 'avg_tariff' | 'total_trade_value' | 'tariff_revenue';
  colorStops: [number, string][];
}

const formatLegendLabel = (value: number, metric: HeatmapLegendProps['metric']) => {
  if (metric === 'avg_tariff') {
    return `${value}%`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value}`;
};

const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ metric, colorStops }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm text-white border border-white/20 z-40">
      <h4 className="font-bold mb-2 capitalize text-white">{metric.replace(/_/g, ' ')}</h4>
      <div className="flex flex-col space-y-1">
        {colorStops.map(([value, color], index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-4 h-4 rounded-full mr-2 border border-white/40"
              style={{ backgroundColor: color }}
            ></span>
            <span className="text-white/90">
              {index === 0 ? '0' : formatLegendLabel(colorStops[index - 1][0], metric)} - {formatLegendLabel(value, metric)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapLegend;
