import { useMemo } from "react";
import * as d3 from "d3";
import { WeatherData } from "../models/WeatherData";

const width = 650;
const height = 650;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

type ChartProps = {
  data: WeatherData[];
};

const Chart = ({ data }: ChartProps) => {
  const barChart = useMemo(() => {
    if (!data) return [];

    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, width]);

    const highMax = d3.max(data, (d) => d.high);
    const lowMin = d3.min(data, (d) => d.low);
    const yScale = d3
      .scaleLinear()
      .domain([lowMin, highMax] as [number, number])
      .range([height, 0]);

    const colorExtent = d3.extent(data, (d) => d.avg).reverse() as [
      number,
      number
    ];
    const colorScale = d3
      .scaleSequential()
      .domain(colorExtent)
      .interpolator(d3.interpolateRdYlBu);

    const bars = data.map((d) => {
      return {
        x: xScale(d.date),
        y: yScale(d.high),
        height: yScale(d.low) - yScale(d.high),
        fill: colorScale(d.avg),
      };
    });
    return bars;
  }, [data]);

  console.log(barChart);

  return (
    <svg width={width} height={height}>
      {barChart.map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width={width / data.length} // Adjust the width of each bar as needed
          height={d.height}
          fill={d.fill}
        />
      ))}
    </svg>
  );
};

export default Chart;
