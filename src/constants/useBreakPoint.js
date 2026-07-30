import { useEffect, useState } from "react";

export default function useBreakpoint() {
  // if (typeof window !== "undefined") {
  //   // window can be used safely here
  // }
  // const getSize = (width) => {
  //   if (width >= 1280) return "xl";
  //   if (width >= 1024) return "lg";
  //   if (width >= 768) return "md";
  //   if (width >= 640) return "sm";
  //   return "xs";
  // };

  // const [breakpoint, setBreakpoint] = useState(getSize(window.innerWidth));

  // useEffect(() => {
  //   const handleResize = () => {
  //     const size = getSize(window.innerWidth);
  //     setBreakpoint(size);
  //     console.log("Current screen size:", size); // 🔥 console log
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // return breakpoint;
  return null;
}
