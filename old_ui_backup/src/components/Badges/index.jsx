import React from "react";
import { Badge } from "primereact/badge";

const index = () => {
  return (
    <div>
      <i
        className="pl-2 pi pi-bell p-overlay-badge"
        style={{ fontSize: "1rem" }}
      >
        <Badge value="2"></Badge>
      </i>
    </div>
  );
};

export default index;
