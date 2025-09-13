declare module 'react-plotly.js' {
  import * as React from 'react';
  import { PlotParams, Data, Layout } from 'plotly.js';

  interface PlotProps extends Partial<PlotParams> {
    data: Data[];
    layout: Partial<Layout>;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
  }

  const Plot: React.ComponentClass<PlotProps>;
  export default Plot;
}
