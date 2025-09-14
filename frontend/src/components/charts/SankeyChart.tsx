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

  const labels: string[] = [data.from];
  const source: number[] = [];
  const target: number[] = [];
  const value: number[] = [];
  const linkColors: string[] = [];
  const linkCustomData: any[] = [];
  const nodeColors: string[] = ['#374151']; // Dark gray for USA node 

  const nodeMap: { [key: string]: number } = { [data.from]: 0 };
  let nodeIndex = 1;

  // Sort HS2 sectors by value and take top 4 to show only the most essential sectors
  const topHS2Sectors = [...data.children]
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 4);

  const minTariff = Math.min(...topHS2Sectors.flatMap((c: any) => [c.tariff, ...c.children.map((sc: any) => sc.tariff)]));
  const maxTariff = Math.max(...topHS2Sectors.flatMap((c: any) => [c.tariff, ...c.children.map((sc: any) => sc.tariff)]));
  
  const colorScale = scaleLinear<string>()
    .domain([minTariff, (minTariff + maxTariff) / 2, maxTariff])
    .range(['#0ea5e9', '#3b82f6', '#1e40af']); // Sky blue to blue to dark blue

  topHS2Sectors.forEach((hs2: any) => {
    if (!nodeMap.hasOwnProperty(hs2.name)) {
      nodeMap[hs2.name] = nodeIndex++;
      labels.push(wrapLabel(hs2.name, 15));
      nodeColors.push('#6b7280'); // Medium gray for HS2 nodes
    }
    const hs2Index = nodeMap[hs2.name];

    source.push(0); // from USA
    target.push(hs2Index);
    value.push(hs2.value);
    linkColors.push(colorScale(hs2.tariff));
    linkCustomData.push({ tariff: hs2.tariff });

    // Sort HS4 sub-sectors by value and take top 1 per HS2 for maximum simplicity
    const topHS4Sectors = [...hs2.children]
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 1);

    topHS4Sectors.forEach((hs4: any) => {
      const hs4Description = getHSDescription(hs4.hs4, hs4.name);
      const hs4Name = `${hs4Description} (${hs2.name})`;
      if (!nodeMap.hasOwnProperty(hs4Name)) {
        nodeMap[hs4Name] = nodeIndex++;
        labels.push(wrapLabel(hs4Description, 12)); 
        nodeColors.push('#9ca3af'); // Light gray for HS4 nodes
      }
      const hs4Index = nodeMap[hs4Name];

      source.push(hs2Index);
      target.push(hs4Index);
      value.push(hs4.value);
      linkColors.push(colorScale(hs4.tariff));
      linkCustomData.push({ tariff: hs4.tariff });
    });
  });

  const plotData: any = [{
    type: 'sankey',
    orientation: 'h',
    node: {
      pad: 60,
      thickness: 35,
      line: {
        color: 'black',
        width: 0.5
      },
      label: labels,
      color: nodeColors,
      labelposition: 'right',
      labelside: 'right'
    },
    link: {
      source: source,
      target: target,
      value: value,
      color: linkColors.map(c => {
        const d3Color = rgb(c);
        return `rgba(${d3Color.r}, ${d3Color.g}, ${d3Color.b}, 0.5)`;
      }),
      customdata: linkCustomData,
      hovertemplate: 'Value: %{value:$,.0f}<br>Tariff: %{customdata.tariff:.2f}%<extra></extra>'
    }
  }];

  // Remove annotations to clean up the chart
  const annotations: any[] = [];


  const layout = {
    title: {
      text: 'US Trade Flows by Sector (Size = Trade Value, Color = Tariff Rate)',
      font: { color: '#ffffff', size: 14 }
    },
    font: {
      size: 12,
      color: '#ffffff'
    },
    autosize: true,
    height: 600,
    margin: { l: 120, r: 120, b: 50, t: 60 },
    annotations: annotations,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)'
  };

  return (
    <Plot
      data={plotData}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler
    />
  );
};

export default SankeyChart;
