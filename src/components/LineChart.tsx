import { useMemo } from "react";
import * as d3 from "d3";
import { WeatherData } from "../models/WeatherData";

const width = 650;
const height = 650;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

type LineChartProps = {
  data: WeatherData[];
};

const LineChart = ({ data }: LineChartProps) => {
  const lineChart = useMemo(() => {
    if (!data) return [];

    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    console.log(xExtent);
    const xScale = d3.scaleTime().domain(xExtent).range([0, width]);
    console.log(xScale);

    const highMax = d3.max(data, (d) => d.high) as number;
    const lowMin = d3.min(data, (d) => d.low) as number;
    const yScale = d3.scaleTime().domain([lowMin, highMax]).range([height, 0]);

    const highLine = d3
      .line<WeatherData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.high));

    const lowLine = d3
      .line<WeatherData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.low));

    return [
      { path: highLine(data), stroke: "#FF6063" },
      { path: lowLine(data), stroke: "#0089BA" },
    ];
  }, [data]);
  console.log(lineChart);

  return (
    <svg width={width} height={height}>
      {lineChart.length > 0 && (
        <>
          <path
            d={lineChart[0].path ?? undefined}
            fill="none"
            stroke={lineChart[0].stroke}
            strokeWidth="1"
          />
          <path
            d={lineChart[1].path ?? undefined}
            fill="none"
            stroke={lineChart[1].stroke}
            strokeWidth="1"
          />
        </>
      )}
    </svg>
  );
};

export default LineChart;
