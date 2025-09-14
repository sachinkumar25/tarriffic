"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { getHSDescription } from '@/lib/hsDictionary';

interface ProductData {
  hs4: string;
  name: string;
  value: number;
  tariff: number;
  share_of_total: number;
}

interface SunburstChartProps {
  data: any;
  onProductClick: (product: ProductData) => void;
}

const wrapText = (text: string, maxLen: number = 20): string => {
  if (text.length <= maxLen) return text;
  const words = text.split(' ');
  let line = '';
  let result = '';
  for (const word of words) {
    if ((line + word).length > maxLen) {
      result += line.trim() + '<br>';
      line = '';
    }
    line += word + ' ';
  }
  result += line.trim();
  return result;
};

const SunburstChart: React.FC<SunburstChartProps> = ({ data, onProductClick }) => {
  if (!data || !data.children) {
    return <div className="text-center p-8">No data available for Sunburst chart.</div>;
  }

  const rootId = 'world';
  const labels: string[] = [data.to];
  const parents: string[] = [''];
  const values: number[] = [data.total_value];
  const ids: string[] = [rootId];
  const customdata: any[] = [{
    tariff: 0,
    share_of_total: 100
  }];
  
  data.children.forEach((hs2: any) => {
    const hs2_id = hs2.hs2.toString();
    const hs2Description = getHSDescription(hs2.hs2, hs2.name);
    ids.push(hs2_id);
    labels.push(`<b>${wrapText(hs2Description)}</b>`);
    parents.push(rootId);
    values.push(hs2.value);
    customdata.push({
      tariff: hs2.tariff,
      share_of_total: (hs2.value / data.total_value) * 100
    });

    hs2.children.forEach((hs4: any) => {
      const hs4_id = hs4.hs4.toString();
      const hs4Description = getHSDescription(hs4.hs4, hs4.name);
      ids.push(hs4_id);
      labels.push(wrapText(hs4Description));
      parents.push(hs2_id);
      values.push(hs4.value);
      customdata.push({
        tariff: hs4.tariff,
        share_of_total: (hs4.value / data.total_value) * 100
      });
    });
  });

  const plotData: any = [{
    type: 'sunburst',
    ids: ids,
    labels: labels,
    parents: parents,
    values: values,
    customdata: customdata,
    marker: {
      colors: customdata.map(d => d.tariff),
      colorscale: [
        [0, '#0ea5e9'], // Sky blue for low tariffs
        [0.5, '#3b82f6'], // Blue for medium tariffs
        [1, '#1e40af'] // Dark blue for high tariffs
      ],
      showscale: true,
      colorbar: {
        title: 'Tariff Burden (%)',
        titlefont: { color: '#ffffff' },
        tickfont: { color: '#ffffff' }
      }
    },
    hovertemplate: '<b>%{label}</b><br>Trade Value: %{value:$,.2s}<br>Tariff: %{customdata.tariff:.2f}%<br>Share of Total: %{customdata.share_of_total:.2f}%<extra></extra>',
    outsidetextfont: { size: 16, family: 'Inter, sans-serif', color: '#ffffff' },
    leaf: { opacity: 0.8 },
    textfont: { size: 14, family: 'Inter, sans-serif', color: '#ffffff' }
  }];

  const layout = {
    title: {
      text: 'Hierarchical Trade Data by Sector',
      font: { color: '#ffffff', size: 16 }
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    autosize: true,
    font: {
      family: 'Inter, sans-serif',
      color: '#ffffff'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
      config={{
        displayModeBar: true,
        responsive: true,
      }}
      onClick={(e: any) => {
        const point = e.points[0];
        const id = point.id;
        if (id && id.length === 4 && parents[point.pointNumber] !== rootId) {
          const hs4 = id;
          const product = {
            hs4: hs4,
            name: point.label.replace(/<br>/g, ' ').replace(/<b>/g, '').replace(/<\/b>/g, ''),
            value: point.value,
            tariff: point.customdata.tariff,
            share_of_total: point.customdata.share_of_total,
          };
          onProductClick(product);
        }
      }}
    />
  );
};

export default SunburstChart;
