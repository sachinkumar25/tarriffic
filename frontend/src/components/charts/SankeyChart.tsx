"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';
import { getHSDescription } from '@/lib/hsDictionary';

const wrapLabel = (text: string, maxLength: number = 15): string => {
  if (text.length <= maxLength) return text;
  const words = text.split(' ');
  let result = '';
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > maxLength && currentLine.length > 0) {
      result += currentLine.trim() + '<br>';
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }
  result += currentLine.trim();
  return result;
};

const SankeyChart = ({ data }: { data: any }) => {
  if (!data || !data.children) {
    return <div className="text-center p-8">No data available for Sankey chart.</div>;
  }

  const labels: string[] = [];
  const source: number[] = [];
  const target: number[] = [];
  const value: number[] = [];
  const linkColors: string[] = [];
  const linkCustomData: any[] = [];
  const nodeColors: string[] = [];

  const nodeMap: { [key: string]: number } = {};
  let nodeIndex = 0;

  // Add source node (USA)
  const sourceNode = data.from || "United States";
  nodeMap[sourceNode] = nodeIndex++;
  labels.push(sourceNode);
  nodeColors.push('#374151'); // Dark gray for USA node

  // Sort HS2 sectors by value and take top 5 for better visualization
  const topHS2Sectors = [...data.children]
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Calculate tariff range for color scaling
  const allTariffs = topHS2Sectors.flatMap((c: any) => [c.tariff, ...(c.children || []).map((sc: any) => sc.tariff)]);
  const minTariff = Math.min(...allTariffs);
  const maxTariff = Math.max(...allTariffs);
  
  const colorScale = scaleLinear<string>()
    .domain([minTariff, maxTariff])
    .range(['#0ea5e9', '#1e40af']); // Sky blue to dark blue

  // Add HS2 sector nodes and links
  topHS2Sectors.forEach((hs2: any) => {
    const hs2Description = getHSDescription(hs2.hs2, hs2.name);
    if (!nodeMap.hasOwnProperty(hs2Description)) {
      nodeMap[hs2Description] = nodeIndex++;
      labels.push(wrapLabel(hs2Description, 20));
      nodeColors.push('#6b7280'); // Medium gray for HS2 nodes
    }
    const hs2Index = nodeMap[hs2Description];

    // Link from USA to HS2 sector
    source.push(0); // USA node index
    target.push(hs2Index);
    value.push(hs2.value);
    linkColors.push(colorScale(hs2.tariff));
    linkCustomData.push({ tariff: hs2.tariff, level: 'HS2' });

    // Add top HS4 sub-sectors (limit to 2 per HS2 for clarity)
    const topHS4Sectors = [...(hs2.children || [])]
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 2);

    topHS4Sectors.forEach((hs4: any) => {
      const hs4Description = getHSDescription(hs4.hs4, hs4.name);
      if (!nodeMap.hasOwnProperty(hs4Description)) {
        nodeMap[hs4Description] = nodeIndex++;
        labels.push(wrapLabel(hs4Description, 15)); 
        nodeColors.push('#9ca3af'); // Light gray for HS4 nodes
      }
      const hs4Index = nodeMap[hs4Description];

      // Link from HS2 to HS4
      source.push(hs2Index);
      target.push(hs4Index);
      value.push(hs4.value);
      linkColors.push(colorScale(hs4.tariff));
      linkCustomData.push({ tariff: hs4.tariff, level: 'HS4' });
    });
  });

  const plotData: any = [{
    type: 'sankey',
    orientation: 'h',
    arrangement: 'snap',
    node: {
      pad: 15,
      thickness: 20,
      line: {
        color: 'rgba(255,255,255,0.2)',
        width: 1
      },
      label: labels,
      color: nodeColors,
      labelposition: 'right',
      labelside: 'right',
      labelpadding: 10
    },
    link: {
      source: source,
      target: target,
      value: value,
      color: linkColors.map(c => {
        const d3Color = rgb(c);
        return `rgba(${d3Color.r}, ${d3Color.g}, ${d3Color.b}, 0.6)`;
      }),
      customdata: linkCustomData,
      hovertemplate: '<b>%{customdata.level}</b><br>Value: %{value:$,.0f}<br>Tariff: %{customdata.tariff:.2f}%<extra></extra>'
    }
  }];

  const layout = {
    title: {
      text: 'US Trade Flows by Sector (Size = Trade Value, Color = Tariff Rate)',
      font: { color: '#ffffff', size: 16 },
      x: 0.5,
      xanchor: 'center' as const
    },
    font: {
      size: 11,
      color: '#ffffff',
      family: 'Inter, sans-serif'
    },
    autosize: true,
    height: 500,
    margin: { l: 80, r: 80, b: 40, t: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: false
  };

  return (
    <div className="w-full h-full">
      <Plot
        data={plotData}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
};

export default SankeyChart;
