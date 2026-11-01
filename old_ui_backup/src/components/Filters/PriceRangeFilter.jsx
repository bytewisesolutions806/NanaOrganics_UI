"use client";

import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";

const PriceRange = ({ min, max, value, onChange }) => {
  const [range, setRange] = useState(value);

  useEffect(() => {
    setRange(value);
  }, [value]);

  const updateRange = (val) => {
    if (val[0] <= val[1]) {
      setRange(val);
      onChange(val);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* INPUTS */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 mb-3 sm:mb-4">

        <InputText
          value={range[0]}
          type="text"
          placeholder="Min"
          className="h-12 w-full rounded-xl  text-center bg-[#E6F4F2] text-lg"
          onChange={(e) =>
            updateRange([+e.target.value || min, range[1]])
          }
        />

        <span className="text-gray-500 text-sm">To</span>

        <InputText
          value={range[1]}
          type="text"
          placeholder="Max"
          className="h-12 w-full rounded-xl bg-[#E6F4F2] text-center text-lg"
          onChange={(e) =>
            updateRange([range[0], +e.target.value || max])
          }
        />
      </div>

      {/* SLIDER WRAPPER (IMPORTANT) */}
      <div className="mt-7 mb-4">
      <div className=" pr-7">
        <Slider
          value={range}
          onChange={(e) => updateRange(e.value)}
          min={min}
          max={max}
          range
          className="w-full"
        />
      </div>
      </div>
    </div>
  );
};

export default PriceRange;
