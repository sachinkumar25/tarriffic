import React from 'react';

interface CountryData {
  country: string;
  iso_a3: string;
  avg_tariff: number;
  total_trade_value: number;
  tariff_revenue: number;
  product_count: number;
}

interface HotspotListProps {
  countryData: CountryData[];
  metric: 'avg_tariff' | 'total_trade_value' | 'tariff_revenue';
}

const formatHotspotValue = (value: number, metric: HotspotListProps['metric']) => {
    if (metric === 'avg_tariff') {
        return `${value.toFixed(2)}%`;
    }
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(0)}K`;
    }
    return `$${value}`;
};

const HotspotList: React.FC<HotspotListProps> = ({ countryData, metric }) => {
  const topCountries = [...countryData]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 5);

  return (
    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-md w-64 text-sm text-white border border-white/20 z-40">
      <h3 className="font-bold text-lg mb-2 capitalize text-white">Top 5 {metric.replace(/_/g, ' ')}</h3>
      <ul>
        {topCountries.map((country) => (
          <li key={country.iso_a3} className="flex justify-between items-center py-1 border-b border-white/20">
            <span className="font-semibold text-white">{country.country}</span>
            <span className="font-mono text-xs text-white/80">{formatHotspotValue(country[metric], metric)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotspotList;
