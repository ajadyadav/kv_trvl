import { NextRequest, NextResponse } from 'next/server';
import { searchHotels } from '@/lib/liteapi/hotels';
import { isRateLimited } from '@/lib/rate-limit';
import { hotelSearchSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const limitCheck = isRateLimited(`search:hotels:${ip}`, {
    intervalMs: 60000,
    maxRequests: 15,
  });

  if (limitCheck.limited) {
    return NextResponse.json(
      { data: null, error: 'Search rate limit exceeded. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((limitCheck.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const result = hotelSearchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { cityCode, checkIn, checkOut, adults, children, rooms } = result.data;

    if (!cityCode) {
      return NextResponse.json(
        { data: null, error: 'Destination city is required' },
        { status: 400 }
      );
    }

    const offers = await searchHotels({
      cityCode,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
    });

    return NextResponse.json({ data: offers });
  } catch (error: any) {
    console.error('Error searching hotels route:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'Failed to retrieve hotel rates' },
      { status: error.status || 500 }
    );
  }
}
