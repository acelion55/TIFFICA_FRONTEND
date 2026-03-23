import { NextResponse } from 'next/server';

let userProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  address: '123 Main St, Anytown, USA'
};

export async function GET() {
  return NextResponse.json({ data: userProfile });
}

export async function PUT(request: Request) {
  const data = await request.json();
  userProfile = { ...userProfile, ...data };
  return NextResponse.json({ data: userProfile });
}
