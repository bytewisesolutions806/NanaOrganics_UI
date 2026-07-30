"use client";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
// import "./index.scss";

export default function SearchBox() {
  const [value, setValue] = useState("");

  return (
    <div
      className="
    relative w-full 
    max-w-[52.5rem] 
  "
    >
      {/* Search Icon */}
      <i
        className="
      pi pi-search
      absolute left-4 top-1/2 -translate-y-1/2
      text-[#2c665e]
      text-[1rem]
      md:text-[1rem]
      sm:text-[0.9rem]
    "
      />

      {/* Input */}
      <InputText
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        className="
      w-full outline-none
      rounded-[10px]
      border border-[#cfe2e0]
      pl-10
      text-[#0d1d2c]
      focus:shadow-none
      transition
      h-[46px] text-[0.9rem]       /* desktop */
      md:h-[40px] md:text-[0.84rem] /* tablet */
      sm:h-[36px] sm:text-[0.75rem] sm:pl-8 /* small mobile */
    "
      />
    </div>
  );
}
