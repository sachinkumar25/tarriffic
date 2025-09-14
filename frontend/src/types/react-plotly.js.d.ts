declare module 'react-plotly.js' {
  import * as React from 'react'
  import {
    PlotParams,
    Data,
    Layout,
    PlotlyClickEvent as PlotlyClickEventOfficial,
    Config,
  } from 'plotly.js'

  export type PlotlyClickEvent = PlotlyClickEventOfficial

  interface PlotProps extends Partial<PlotParams> {
    data: Data[]
    layout: Partial<Layout>
    config?: Partial<Config>
    style?: React.CSSProperties
    useResizeHandler?: boolean
    onClick?: (event: Readonly<PlotlyClickEvent>) => void
  }

  const Plot: React.ComponentClass<PlotProps>
  export default Plot
}
