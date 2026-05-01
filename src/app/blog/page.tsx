import { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: "Tiffica Food Blog - Tiffin Stories, Recipes & Nutrition Tips in Jaipur",
  description: "Explore the Tiffica food blog for the latest on healthy eating, home-cooked meal recipes, and food culture in Jaipur, Ajmer, and Beawar.",
  keywords: "food blog jaipur, healthy eating tips, tiffin recipes, rajasthani food blog, tiffica stories",
};

export default function BlogListing() {
  return <BlogClient />;
}
