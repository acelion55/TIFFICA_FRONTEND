import { NextResponse } from 'next/server';

const pastOrders = [
  {
    id: 'ord1',
    date: '2024-05-20',
    totalAmount: 350.00,
    restaurant: {
        name: 'The Royal Kitchen',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop'
    },
    items: [
      { id: 'meal1', name: 'Paneer Butter Masala', quantity: 1, price: 250 },
      { id: 'drink1', name: 'Coke', quantity: 1, price: 100 },
    ],
  },
  {
    id: 'ord2',
    date: '2024-05-18',
    totalAmount: 180.00,
    restaurant: {
        name: 'Breakfast Central',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop'
    },
    items: [
      { id: 'meal2', name: 'Idli Sambhar', quantity: 2, price: 90 },
    ],
  },
  {
    id: 'ord3',
    date: '2024-05-15',
    totalAmount: 450.00,
    restaurant: {
        name: 'The Grand Thali',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop'
    },
    items: [
        { id: 'meal3', name: 'Special Veg Thali', quantity: 2, price: 225 },
    ]
  }
];

export async function GET() {
  // In a real app, you would fetch this data from a database
  return NextResponse.json({ orders: pastOrders });
}
