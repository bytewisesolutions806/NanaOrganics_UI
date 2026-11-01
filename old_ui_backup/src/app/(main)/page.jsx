import HomePageClient from './HomePageClient';

export const revalidate = 300;

export default async function HomePage() {
  return <HomePageClient />;
}
