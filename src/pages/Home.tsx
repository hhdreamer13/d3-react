import { useEffect, useState } from "react";
import RadialChart from "../components/RadialChart";
import BarChart from "../components/BarChart";
import { WeatherData } from "../models/WeatherData";
import LineChart from "../components/LineChart";

type TempsData = Record<string, WeatherData[]>;

const Home = () => {
  const [temps, setTemps] = useState<TempsData>({});
  const [city, setCity] = useState("sf");
  const [range, setRange] = useState<Date[] | undefined>();
  console.log(range);

  useEffect(() => {
    Promise.all([fetch("/sf.json"), fetch("/ny.json")])
      .then((responses) => Promise.all(responses.map((resp) => resp.json())))
      .then(([sf, ny]) => {
        sf.forEach((day: any) => (day.date = new Date(day.date)));
        ny.forEach((day: any) => (day.date = new Date(day.date)));

        setTemps({ sf, ny });
      });
  }, []);

  const updateCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
  };
  const updateRange = (range: Date[]) => {
    setRange(range);
  };

  const data = temps[city];

  return (
    <div className="w-screen h-screen">
      <div className="mx-auto w-3/4 flex flex-col items-center mt-20">
        <h1 className="text-xl my-4">
          2017 Temperatures for
          <select
            name="city"
            onChange={updateCity}
            className="text-lg px-3 py-2 outline-none rounded-md mx-auto block my-1"
          >
            {[
              { label: "San Francisco", value: "sf" },
              { label: "New York", value: "ny" },
            ].map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </select>
        </h1>
        <p className="text-warning">
          warning: these are <em>not</em> meant to be good examples of data
          visualizations, but just to show the possibility of using D3 and React
        </p>
        <RadialChart data={data} range={range} updateRange={updateRange} />
        <BarChart data={data} range={range} updateRange={updateRange} />
        <LineChart data={data} range={range} updateRange={updateRange} />
        <p>
          (Weather data from{" "}
          <a href="wunderground.com" target="_blank">
            wunderground.com
          </a>
          )
        </p>
      </div>
    </div>
  );
};

export default Home;
