"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisSheet from './AnalysisSheet';

const SankeyChart = dynamic(() => import('./charts/SankeyChart'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
    </div>
  ) 
});

const TreemapChart = dynamic(() => import('./charts/TreemapChart'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
    </div>
  ) 
});

const SunburstChart = dynamic(() => import('./charts/SunburstChart'), { 
  ssr: false, 
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
    </div>
  ) 
});

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
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading trade data...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-2xl mb-2">⚠️</div>
            <p className="text-red-300 text-lg mb-2">Error loading data</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      );
    }
    
    if (!data) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-300 text-lg">No data available</p>
            <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      );
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
    <div className="w-full h-full flex flex-col">
      {/* Header with tabs */}
      <div className="mb-6">
        <Tabs value={view} onValueChange={(value) => setView(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <TabsTrigger 
              value="sankey" 
              className="data-[state=active]:bg-sky-500/30 data-[state=active]:text-sky-100 data-[state=active]:shadow-sm text-gray-300 font-medium transition-all duration-200 hover:text-white hover:bg-white/10 rounded-md"
            >
              Trade Flows
            </TabsTrigger>
            <TabsTrigger 
              value="treemap" 
              className="data-[state=active]:bg-sky-500/30 data-[state=active]:text-sky-100 data-[state=active]:shadow-sm text-gray-300 font-medium transition-all duration-200 hover:text-white hover:bg-white/10 rounded-md"
            >
              Market Share
            </TabsTrigger>
            <TabsTrigger 
              value="sunburst" 
              className="data-[state=active]:bg-sky-500/30 data-[state=active]:text-sky-100 data-[state=active]:shadow-sm text-gray-300 font-medium transition-all duration-200 hover:text-white hover:bg-white/10 rounded-md"
            >
              Hierarchy
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart container with proper bounds */}
      <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="w-full h-full p-6">
          {renderContent()}
        </div>
      </div>

      {/* Analysis sheet */}
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