import { useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { WeatherData } from "../models/WeatherData";

const width = 650;
const height = 650;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

type LineChartProps = {
  data: WeatherData[];
  range: Date[] | undefined;
  updateRange: (range: Date[]) => void;
};

const LineChart = ({ data }: LineChartProps) => {
  // Axis Refs
  const xAxisRef = useRef(null);
  const yAxisRef = useRef(null);

  // useMemo and chart calculations
  const { linePaths, xScale, yScale } = useMemo(() => {
    // When data is not ready
    if (!data)
      return {
        linePaths: [],
        xScale: d3.scaleTime().domain([new Date(), new Date()]),
        yScale: d3.scaleLinear().domain([0, 1]),
      };

    // data is ready and we can calculate
    const xExtent = d3.extent(data, (d) => d.date) as [Date, Date];
    const xScale = d3
      .scaleTime()
      .domain(xExtent)
      .range([margin.left, width - margin.left]);

    const highMax = d3.max(data, (d) => d.high) as number;
    const lowMin = d3.min(data, (d) => d.low) as number;
    const yScale = d3
      .scaleTime()
      .domain([lowMin, highMax])
      .range([height - margin.bottom, margin.top]);

    const highLine = d3
      .line<WeatherData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.high));

    const lowLine = d3
      .line<WeatherData>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.low));

    const linePaths = [
      { path: highLine(data), stroke: "#FF6063" },
      { path: lowLine(data), stroke: "#0089BA" },
    ];

    return { linePaths, xScale, yScale };
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

  return (
    <svg width={width} height={height}>
      {linePaths.length > 0 && (
        <>
          <path
            d={linePaths[0].path ?? undefined}
            fill="none"
            stroke={linePaths[0].stroke}
            strokeWidth="1"
          />
          <path
            d={linePaths[1].path ?? undefined}
            fill="none"
            stroke={linePaths[1].stroke}
            strokeWidth="1"
          />
        </>
      )}
      <g ref={xAxisRef} transform={`translate(0, ${height - margin.bottom})`} />
      <g ref={yAxisRef} transform={`translate(${margin.left}, 0)`} />
    </svg>
  );
};

export default LineChart;
