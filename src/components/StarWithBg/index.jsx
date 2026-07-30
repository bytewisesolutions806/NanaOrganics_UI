import Image from "next/image";
// import StarImg from "../../assets/images/StarRating/StarRating.svg";

export default function StarWithBg({ filled = true, size = 20 }) {
  return (
    <div
      className={`flex items-center justify-center rounded ${
        filled ? "bg-[#21A56E]" : "bg-[#E6F4F2]"
      }`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/StarRating.svg"
        alt="Star"
        width={Math.floor(size * 0.6)}
        height={Math.floor(size * 0.6)}
      />
    </div>
  );
}
