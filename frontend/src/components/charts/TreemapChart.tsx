"use client";
import React from 'react';
import Plot from 'react-plotly.js';

interface ProductData {
  hs4: string;
  name: string;
  value: number;
  tariff: number;
  share_of_total: number;
}

interface TreemapChartProps {
  data: any;
  onProductClick: (product: ProductData) => void;
}

const formatValue = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${(value / 1e3).toFixed(1)}K`;
};

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


const TreemapChart: React.FC<TreemapChartProps> = ({ data, onProductClick }) => {
  if (!data || !data.children) {
    return <div className="text-center p-8">No data available for Treemap chart.</div>;
  }

  const rootId = 'world';
  const labels: string[] = [wrapText(data.to)];
  const parents: string[] = [''];
  const values: number[] = [data.total_value];
  const ids: string[] = [rootId];
  const customdata: any[] = [{
    tariff: 0,
    share_of_total: 100
  }];
  const texttemplates: string[] = ['<b>%{label}</b><br>%{value}'];

  data.children.forEach((hs2: any) => {
    const hs2_id = hs2.hs2.toString();
    ids.push(hs2_id);
    labels.push(`<b>${wrapText(hs2.name)}</b>`);
    parents.push(rootId);
    values.push(hs2.value);
    customdata.push({
      tariff: hs2.tariff,
      share_of_total: (hs2.value / data.total_value) * 100
    });
    texttemplates.push('<b>%{label}</b><br>%{value}');


    hs2.children.forEach((hs4: any) => {
      const hs4_id = hs4.hs4.toString();
      ids.push(hs4_id);
      labels.push(wrapText(hs4.name));
      parents.push(hs2_id);
      values.push(hs4.value);
      customdata.push({
        tariff: hs4.tariff,
        share_of_total: (hs4.value / data.total_value) * 100
      });
      texttemplates.push('%{label}<br>%{value}');
    });
  });

  const plotData: any = [{
    type: 'treemap',
    ids: ids,
    labels: labels,
    parents: parents,
    values: values,
    customdata: customdata,
    textinfo: 'label',
    texttemplate: texttemplates,
    textposition: 'middle center',
    textfont: {
      family: 'Inter, sans-serif',
      size: 14,
    },
    marker: {
      colors: customdata.map(d => d.tariff),
      colorscale: 'RdYlGn',
      reversescale: true,
      showscale: true,
      colorbar: {
        title: 'Tariff Burden (%)'
      }
    },
    hovertemplate: '<b>%{label}</b><br>Trade Value: %{value:$,.2s}<br>Tariff: %{customdata.tariff:.2f}%<br>Share of Total: %{customdata.share_of_total:.2f}%<extra></extra>',
  }];

  const layout = {
    title: 'Trade Composition by Sector',
    width: 1200,
    height: 800,
    font: {
      family: 'Inter, sans-serif',
    },
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
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

export default TreemapChart;
