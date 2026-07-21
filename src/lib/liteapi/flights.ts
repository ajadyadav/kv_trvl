import { fetchLiteApi, LiteApiError } from './client';
import { FlightSearchParams, FlightOffer } from '@/types';

// Let's implement flight search.
// If LiteAPI flight endpoints are disabled or return 403/404 (common in sandbox),
// we fall back to high-quality simulated flight offers to ensure the portfolio flows
// (search -> select -> book -> confirm -> profile) work completely.
export async function searchFlights(params: FlightSearchParams): Promise<{ offers: FlightOffer[]; isFallback: boolean }> {
  try {
    // Attempt real LiteAPI call first (in case flight API is active in their tier)
    // Typical LiteAPI flight endpoint format: POST /flights/search or similar
    const response: any = await fetchLiteApi('/flights/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response && Array.isArray(response.data)) {
      return {
        offers: response.data.map((f: any) => ({
          offerId: f.offerId,
          airline: f.airline || 'Unknown Airline',
          airlineCode: f.airlineCode || 'XX',
          flightNumber: f.flightNumber || '000',
          origin: f.origin || params.originIata,
          destination: f.destination || params.destinationIata,
          departureTime: f.departureTime || params.departureDate + 'T10:00:00Z',
          arrivalTime: f.arrivalTime || params.departureDate + 'T14:00:00Z',
          duration: f.duration || '4h 0m',
          stops: f.stops ?? 0,
          cabinClass: f.cabinClass || params.cabinClass,
          price: f.price || 250,
          currency: f.currency || params.currency || 'USD',
          refundable: f.refundable || false,
          baggageAllowance: f.baggageAllowance || '1 checked bag',
        })),
        isFallback: false,
      };
    }
  } catch (error: any) {
    // Catch 403 (Forbidden), 404 (Not Found), 501 (Not Implemented) or key configuration issues
    if (error instanceof LiteApiError && [403, 404, 501, 503].includes(error.status)) {
      console.warn('LiteAPI Flight API returned status:', error.status, '. Falling back to simulated flight offers.');
    } else {
      console.error('Unexpected error searching flights, falling back:', error);
    }
  }

  // Fallback / Simulated Data: Returns high-quality mock data so the app flow can still be showcased
  const airlines = [
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'American Airlines', code: 'AA' },
    { name: 'JetBlue Airways', code: 'B6' },
  ];

  const mockOffers: FlightOffer[] = airlines.map((airline, idx) => {
    const hours = 2 + idx * 2;
    const price = 180 + idx * 125;
    const depTime = `${params.departureDate}T0${7 + idx}:15:00Z`;
    const arrTime = `${params.departureDate}T${7 + idx + hours}:45:00Z`;

    return {
      offerId: `mock-flight-offer-${params.originIata}-${params.destinationIata}-${idx}-${Date.now()}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: `${100 + idx * 17}`,
      origin: params.originIata,
      destination: params.destinationIata,
      departureTime: depTime,
      arrivalTime: arrTime,
      duration: `${hours}h 30m`,
      stops: idx % 2 === 0 ? 0 : 1,
      cabinClass: params.cabinClass,
      price,
      currency: params.currency || 'USD',
      refundable: idx % 3 === 0,
      baggageAllowance: idx % 2 === 0 ? '1 Carry-on, 1 Checked bag' : 'Carry-on only',
    };
  });

  return {
    offers: mockOffers,
    isFallback: true,
  };
}

export async function bookFlight(params: {
  offerId: string;
  passengers: any[];
  idempotencyKey: string;
}): Promise<{ bookingId: string; status: string }> {
  // If it's a mock offer, we return a mock confirmation
  if (params.offerId.startsWith('mock-flight-offer')) {
    return {
      bookingId: `mock-flight-book-${crypto.randomUUID()}`,
      status: 'confirmed',
    };
  }

  // Attempt real LiteAPI booking if real offerId
  const response: any = await fetchLiteApi('/flights/book', {
    method: 'POST',
    body: JSON.stringify({
      offerId: params.offerId,
      passengers: params.passengers,
    }),
  });

  if (!response || !response.data) {
    throw new Error('Invalid flight booking response from LiteAPI');
  }

  return {
    bookingId: response.data.bookingId,
    status: response.data.status || 'confirmed',
  };
}

export async function cancelFlight(bookingId: string): Promise<boolean> {
  if (bookingId.startsWith('mock-flight-book')) {
    return true;
  }

  const response: any = await fetchLiteApi(`/flights/bookings/${bookingId}`, {
    method: 'DELETE', // Typical cancel
  });

  return response?.data?.status === 'cancelled';
}
