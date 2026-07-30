// app/loading.jsx OR app/home/loading.jsx

import { ProgressSpinner } from "primereact/progressspinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <ProgressSpinner
        style={{ width: "60px", height: "60px" }}
        strokeWidth="4"
        fill="transparent"
        animationDuration="1s"
      />
    </div>
  );
}
