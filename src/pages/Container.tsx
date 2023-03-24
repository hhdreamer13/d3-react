import { useState } from "react";

const Container = () => {
  const [temps, setTemps] = useState();
  const [city, setCity] = useState("");
  return (
    <div>
      <h1>Container</h1>
    </div>
  );
};

export default Container;
