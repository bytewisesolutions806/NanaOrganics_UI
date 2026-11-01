import React from "react";
import Image from "next/image";
import "./index.css";
const Index = () => {
  return (
    <div className="topBanner">
      <Image
        src="/images/topbanner-truck.png"
        style={{ marginRight: "10px" }}
        alt="Truck"
        width={27}
        height={27}
      />
      <span>Enjoy Complimentary Shipping on Orders $50+ | US & Canada</span>
    </div>
  );
};

export default Index;
