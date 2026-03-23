import { NextResponse } from 'next/server';

const plans = [
  { id: 1, name: "Daily Delight", mealsPerDay: 14, mealTimes: ["lunch"], pricePerDay: 1400, savings: "10%", description: "Perfect for lunch lovers", popular: false },
  { id: 2, name: "Power Combo", mealsPerDay: 40, mealTimes: ["lunch", "dinner"], pricePerDay: 3000, savings: "15%", description: "Lunch & Dinner covered", popular: false },
  { id: 3, name: "Full Day Feast", mealsPerDay: 60, mealTimes: ["breakfast", "lunch", "dinner"], pricePerDay: 5500, savings: "20%", description: "All meals, all day", popular: true },
];

export async function GET() {
  return NextResponse.json({ plans });
}
