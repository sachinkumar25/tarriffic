import React from 'react';

interface ChartContainerProps {
  isLoading: boolean;
  error: string | null;
  data: any;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ isLoading, error, data, children }) => {
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

  return <div className="w-full h-full">{children}</div>;
};

export default ChartContainer;
