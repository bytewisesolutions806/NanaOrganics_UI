// service/reviewService.js
export const reviews = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  userName: `User ${i + 1}`,
  avatar: `https://randomuser.me/api/portraits/men/${i % 99}.jpg`,
  rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 – 5.0
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  content:
    "This product is really good. Quality feels premium and worth the price.This product is really good. Quality feels premium and worth the price.This product is really good. Quality feels premium and worth the price.",
}));
