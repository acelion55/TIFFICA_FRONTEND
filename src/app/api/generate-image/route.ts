import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for image generation
    const prompt = `Professional food photography of ${name}. ${description}. High quality, studio lighting, appetizing presentation, perfect for restaurant menu, 4K quality.`;

    // Use Pollinations.ai for free image generation
    // No API key required - just format the URL with the prompt
    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=512&height=512`;

    return NextResponse.json({
      image: imageUrl,
      success: true,
      note: 'Generated with Pollinations.ai (Flux model)',
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
