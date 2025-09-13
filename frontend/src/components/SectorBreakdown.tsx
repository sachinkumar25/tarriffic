"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisSheet from './AnalysisSheet';

const SankeyChart = dynamic(() => import('./charts/SankeyChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const TreemapChart = dynamic(() => import('./charts/TreemapChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const SunburstChart = dynamic(() => import('./charts/SunburstChart'), { ssr: false, loading: () => <p>Loading chart...</p> });

interface ProductData {
  hs4: string;
  name: string;
  value: number;
  tariff: number;
  share_of_total: number;
}

const SectorBreakdown = () => {
  const [view, setView] = useState<"sankey" | "treemap" | "sunburst">("sankey");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for analysis drawer
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sectors");
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductClick = async (product: ProductData) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyzeProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        throw new Error('Failed to get analysis from the server.');
      }
      const result = await res.json();
      setAnalysis(result.analysis);
    } catch (err: any) {
      setAnalysis(`Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading data...</div>;
    }
    if (error) {
      return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }
    if (!data) {
      return <div className="text-center p-8">No data available.</div>;
    }

    switch (view) {
      case "sankey":
        return <SankeyChart data={data} />;
      case "treemap":
        return <TreemapChart data={data} onProductClick={handleProductClick} />;
      case "sunburst":
        return <SunburstChart data={data} onProductClick={handleProductClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <Tabs value={view} onValueChange={(value) => setView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sankey">Flow</TabsTrigger>
          <TabsTrigger value="treemap">Composition</TabsTrigger>
          <TabsTrigger value="sunburst">Hierarchy</TabsTrigger>
        </TabsList>
        <div className="mt-4 w-full max-h-[70vh]">
          {renderContent()}
        </div>
      </Tabs>
      <AnalysisSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        productData={selectedProduct}
        analysis={analysis}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default SectorBreakdown;
