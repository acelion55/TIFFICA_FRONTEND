import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ addresses: [] }, { status: 401 });
  }
  try {
    const res = await fetch(`${BACKEND}/auth/profile`, {
      headers: { Authorization: token },
    });
    if (!res.ok) return NextResponse.json({ addresses: [] }, { status: res.status });
    const data = await res.json();
    const addresses = (data.addresses || []).map((a: any) => ({
      id: a._id,
      fullAddress: a.fullAddress || `${a.houseNo}, ${a.area}`,
      houseNo: a.houseNo,
      landmark: a.landmark,
      area: a.area,
      addressType: a.addressType,
      isDefault: a.isDefault,
    }));
    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ addresses: [] }, { status: 500 });
  }
}
