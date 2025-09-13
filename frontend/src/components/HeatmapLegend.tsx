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
    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-sm text-gray-800">
      <h4 className="font-bold mb-2 capitalize">{metric.replace(/_/g, ' ')}</h4>
      <div className="flex flex-col space-y-1">
        {colorStops.map(([value, color], index) => (
          <div key={index} className="flex items-center">
            <span
              className="w-4 h-4 rounded-full mr-2 border border-gray-400"
              style={{ backgroundColor: color }}
            ></span>
            <span>
              {index === 0 ? '0' : formatLegendLabel(colorStops[index - 1][0], metric)} - {formatLegendLabel(value, metric)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeatmapLegend;
