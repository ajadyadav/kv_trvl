import { NextRequest, NextResponse } from 'next/server';
import { prebookRate } from '@/lib/liteapi/hotels';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Check auth session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rateId } = await request.json();

    if (!rateId) {
      return NextResponse.json({ data: null, error: 'Offer rateId is required' }, { status: 400 });
    }

    // Call prebook step to confirm rate availability and current price
    const prebookResult = await prebookRate(rateId);

    return NextResponse.json({ data: prebookResult });
  } catch (error: any) {
    console.error('Error prebooking hotels route:', error);
    return NextResponse.json(
      { data: null, error: error.message || 'Failed to complete prebook offer validation' },
      { status: error.status || 500 }
    );
  }
}
