import StarWithBg from "../StarWithBg";

export default function RatingStars({ rating, size = 20 }) {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarWithBg key={star} filled={star <= fullStars} size={size} />
      ))}
    </div>
  );
}
