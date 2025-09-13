"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { scaleLinear } from 'd3-scale';
import { rgb } from 'd3-color';
import { getHSDescription } from '@/lib/hsDictionary';

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
  const nodeColors: string[] = ['#888']; 

  const nodeMap: { [key: string]: number } = { [data.from]: 0 };
  let nodeIndex = 1;

  const minTariff = Math.min(...data.children.flatMap((c: any) => [c.tariff, ...c.children.map((sc: any) => sc.tariff)]));
  const maxTariff = Math.max(...data.children.flatMap((c: any) => [c.tariff, ...c.children.map((sc: any) => sc.tariff)]));
  
  const colorScale = scaleLinear<string>()
    .domain([minTariff, (minTariff + maxTariff) / 2, maxTariff])
    .range(['green', 'yellow', 'red']);

  data.children.forEach((hs2: any) => {
    if (!nodeMap.hasOwnProperty(hs2.name)) {
      nodeMap[hs2.name] = nodeIndex++;
      labels.push(hs2.name);
      nodeColors.push('#A9A9A9');
    }
    const hs2Index = nodeMap[hs2.name];

    source.push(0); // from USA
    target.push(hs2Index);
    value.push(hs2.value);
    linkColors.push(colorScale(hs2.tariff));
    linkCustomData.push({ tariff: hs2.tariff });

    hs2.children.forEach((hs4: any) => {
      const hs4Description = getHSDescription(hs4.hs4, hs4.name);
      const hs4Name = `${hs4Description} (${hs2.name})`;
      if (!nodeMap.hasOwnProperty(hs4Name)) {
        nodeMap[hs4Name] = nodeIndex++;
        labels.push(hs4Description); 
        nodeColors.push('#D3D3D3');
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
      pad: 15,
      thickness: 20,
      line: {
        color: 'black',
        width: 0.5
      },
      label: labels,
      color: nodeColors
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

  // Get top 2 HS2 sectors for annotations
  const topSectors = [...data.children].sort((a, b) => b.value - a.value).slice(0, 2);
  const annotations: any[] = topSectors.map((sector, index) => {
    const sectorIndex = nodeMap[sector.name];
    return {
      x: 0.5, 
      y: sectorIndex / (labels.length - 1),
      text: `<b>${sector.name}</b><br>$${(sector.value / 1000000000).toFixed(1)}B`,
      showarrow: true,
      arrowhead: 2,
      ax: index % 2 === 0 ? -80 : 80,
      ay: -40,
      font: {
        size: 12
      }
    };
  });


  const layout = {
    title: 'US Trade Flows by Sector (Size = Trade Value, Color = Tariff Rate)',
    font: {
      size: 10
    },
    width: 1200,
    height: 800,
    margin: { l: 50, r: 50, b: 50, t: 50 },
    annotations: annotations
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
