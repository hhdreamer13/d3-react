import { useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { WeatherData } from "../models/WeatherData";

const width = 650;
const height = 650;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

type ChartProps = {
  data: WeatherData[];
  range: Date[] | undefined;
  updateRange: (range: Date[]) => void;
};

const BarChart = ({ data, range, updateRange }: ChartProps) => {
  // Axis Refs
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);
  const brushRef = useRef(null);

  // function to brush the desired area
  const isColored = (d: WeatherData) => {
    return !range || (range.length && range[0] <= d.date && d.date <= range[1]);
  };

  // useMemo and chart calculations
  const { bars, xScale, yScale, colorScale } = useMemo(() => {
    // When data is not ready
    if (!data) {
      return {
        bars: [],
        xScale: d3.scaleTime().domain([new Date(), new Date()]),
        yScale: d3.scaleLinear().domain([0, 1]),
        colorScale: d3
          .scaleSequential()
          .domain([0, 1])
          .interpolator(d3.interpolateRdYlBu),
      };
    }

    // data is ready and we can calculate
    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const xScale = d3
      .scaleTime()
      .domain(xExtent)
      .range([margin.left, width - margin.left]);

    const highMax = d3.max(data, (d) => d.high);
    const lowMin = d3.min(data, (d) => d.low);
    const yScale = d3
      .scaleLinear()
      .domain([lowMin, highMax] as [number, number])
      .range([height - margin.bottom, margin.top]);

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
        fill: "",
      };
    });

    return { bars, xScale, yScale, colorScale };
  }, [data]);

  // Draw the axis
  useEffect(() => {
    if (xAxisRef.current) {
      const xAxis = d3.axisBottom(xScale);
      d3.select<SVGSVGElement, unknown>(xAxisRef.current).call(xAxis);
    }

    if (yAxisRef.current) {
      const yAxis = d3.axisLeft(yScale);
      d3.select<SVGSVGElement, unknown>(yAxisRef.current).call(yAxis);
    }
  }, [xScale, yScale]);

  // brush calculation and handle events
  useEffect(() => {
    const brush = d3
      .brushX()
      .extent([
        [margin.left, margin.top], // top-left
        [width - margin.right, height - margin.bottom], // bottom-right
      ])
      .on("start brush end", (event) => {
        // d3.event is deprecated
        const [minX, maxX] = event.selection;
        const range = [xScale.invert(minX), xScale.invert(maxX)];
        // console.log(range);
        updateRange(range);
      });

    if (brushRef.current) {
      d3.select<SVGGElement, unknown>(brushRef.current).call(brush);
    }
  }, [range, updateRange]);

  return (
    <svg width={width} height={height}>
      {bars.map((d, i) => (
        <rect
          key={i}
          x={d.x}
          y={d.y}
          width={2}
          height={d.height}
          fill={isColored(data[i]) ? colorScale(data[i].avg) : "#ccc"}
        />
      ))}
      <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
      <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`} />
      <g ref={brushRef} />
    </svg>
  );
};

export default BarChart;
