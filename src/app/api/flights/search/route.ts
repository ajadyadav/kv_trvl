import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/liteapi/flights';
import { isRateLimited } from '@/lib/rate-limit';
import { flightSearchSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const limitCheck = isRateLimited(`search:flights:${ip}`, {
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
    const result = flightSearchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { originIata, destinationIata, departureDate, returnDate, adults, children, infants, cabinClass } = result.data;

    const { offers, isFallback } = await searchFlights({
      originIata,
      destinationIata,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass,
    });

    return NextResponse.json({ data: offers, isFallback });
  } catch (error: any) {
    console.error('Error searching flights route:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'Failed to retrieve flight rates' },
      { status: error.status || 500 }
    );
  }
}
