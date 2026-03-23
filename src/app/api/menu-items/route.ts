import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mealType = searchParams.get('mealType');

  try {
    let url = `${BACKEND}/menu`;
    if (mealType) {
      url = `${BACKEND}/menu/mealtype/${encodeURIComponent(mealType)}`;
    }

    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ items: [] }, { status: res.status });

    const data = await res.json();
    const items = (data.items || []).map((item: any) => ({
      id: item._id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || null,
      category: item.category || item.mealType,
      mealType: item.mealType,
      rating: item.rating || null,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
