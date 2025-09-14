"use client";
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { getHSDescription } from '@/lib/hsDictionary';

interface ProductData {
  hs4: string;
  name: string;
  value: number;
  tariff: number;
  share_of_total: number;
}

interface AnalysisSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productData: ProductData | null;
  analysis: string | null;
  isLoading: boolean;
}

const formatValue = (value: number) => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value}`;
};

const AnalysisSheet: React.FC<AnalysisSheetProps> = ({
  isOpen,
  onClose,
  productData,
  analysis,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="p-6 overflow-y-auto">
        {productData && (
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">
              {getHSDescription(productData.hs4, productData.name)} (HS {productData.hs4})
            </SheetTitle>
            <SheetDescription className="flex items-center space-x-2 pt-2">
              <Badge variant="secondary">Tariff: {productData.tariff.toFixed(2)}%</Badge>
              <Badge variant="secondary">Trade Value: {formatValue(productData.value)}</Badge>
              <Badge variant="secondary">Share: {productData.share_of_total.toFixed(2)}%</Badge>
            </SheetDescription>
          </SheetHeader>
        )}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">AI-Powered Insight</h3>
          {isLoading ? (
            <p>Analyzing...</p>
          ) : (
            <p className="text-base text-left text-gray-700">
              {analysis || 'No analysis available.'}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnalysisSheet;
