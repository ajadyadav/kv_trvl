import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isRateLimited } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting setup
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const limitCheck = isRateLimited(`autosuggest:cities:${ip}`, {
    intervalMs: 60000, // 1 minute
    maxRequests: 30,   // Max 30 requests per minute
  });

  if (limitCheck.limited) {
    return NextResponse.json(
      { data: null, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((limitCheck.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const supabase = await createClient();

  // Search cities using the similarity/search_text index or simple ILIKE fallback if trgm query fails.
  const { data, error } = await supabase
    .from('cities')
    .select('city_name, country_code, liteapi_city_code')
    .ilike('search_text', `%${q}%`)
    .limit(10);

  if (error) {
    console.error('Error fetching cities suggestion:', error);
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
