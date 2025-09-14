declare module 'react-plotly.js' {
    import * as Plotly from 'plotly.js';
    import { Component } from 'react';

    export interface PlotProps {
        data: Plotly.Data[];
        layout: Partial<Plotly.Layout>;
        config?: Partial<Plotly.Config>;
        style?: React.CSSProperties;
        useResizeHandler?: boolean;
        onClick?: (event: Plotly.PlotMouseEvent) => void;
        onHover?: (event: Plotly.PlotMouseEvent) => void;
        // Add any other event handlers you need
    }

    export default class Plot extends Component<PlotProps> {}
}
