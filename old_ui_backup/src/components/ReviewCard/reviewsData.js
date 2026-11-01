const names = [
  "Emily R.",
  "Daniel K.",
  "Sophia M.",
  "Arjun P.",
  "Olivia S.",
  "Rahul V.",
  "Aisha N.",
  "John D.",
  "Priya K.",
  "Michael T.",
];

const reviewTexts = [
  // "Excellent quality and very natural taste.My family loves it and we use it daily.Great product, worth every penny.Healthy and pure, will buy again.Perfect for kids and breakfast.Totally satisfied with the quality.Fast delivery and great packaging.Authentic taste and organic.Highly recommended for daily use.Amazing freshness and flavor.",
  "Excellent quality and very natural taste.My family loves it and we use it daily. I use it daily for my kids – they love it on toast. Appreciate that it's 100% organic and free from additives.",
];

export const reviews = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: names[i % names.length],
  review: reviewTexts[i % reviewTexts.length],
  rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
}));
