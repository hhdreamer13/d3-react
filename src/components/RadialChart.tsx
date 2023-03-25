import { useMemo } from "react";
import * as d3 from "d3";
import { WeatherData } from "../models/WeatherData";

type RadialChartProps = {
  data: WeatherData[];
  range: Date[] | undefined;
  updateRange: (range: Date[]) => void;
};

const width = 650;
const height = 650;

const RadialChart = ({ data, range }: RadialChartProps) => {
  const { slices, tempAnnotations } = useMemo(() => {
    if (!data) return { slices: [], tempAnnotations: [] };

    const radiusScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.low) as number,
        d3.max(data, (d) => d.high) as number,
      ])
      .range([0, width / 2]);

    const colorScale = d3
      .scaleSequential()
      .domain(
        d3.extent(data, (d: WeatherData) => d.avg).reverse() as [number, number]
      )
      .interpolator(d3.interpolateRdYlBu);

    const perSliceAngle = (2 * Math.PI) / data.length;

    const arcGenerator = d3.arc();
    const slices = data.map((d, i) => {
      const path = arcGenerator({
        startAngle: i * perSliceAngle,
        endAngle: (i + 1) * perSliceAngle,
        innerRadius: radiusScale(d.low),
        outerRadius: radiusScale(d.high),
      });
      // slice should be colored if there's no time range
      // or if the slice is within the time range
      const isColored =
        !range || (range.length && range[0] <= d.date && d.date <= range[1]);
      return {
        path,
        fill: isColored ? colorScale(d.avg) : "#ccc",
      };
    });

    const tempAnnotations = [5, 20, 40, 60, 80].map((temp) => {
      return {
        r: radiusScale(temp),
        temp,
      };
    });

    return { slices, tempAnnotations };
  }, [data, range]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {slices.map((d, i) => (
          <path key={i} d={d.path ?? undefined} fill={d.fill} />
        ))}

        {tempAnnotations.map((d, i) => (
          <g key={i}>
            <circle r={d.r} fill="none" stroke="#999" />
            <text y={-d.r - 2} textAnchor="middle">
              {d.temp}℉
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default RadialChart;
