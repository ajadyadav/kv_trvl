import { fetchLiteApi } from './client';
import { HotelSearchParams, HotelOffer, HotelPrebookResult } from '@/types';

// LiteAPI v3.0 retrieve rates for hotels
export async function searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
  try {
    const occupancies = [
      {
        adults: params.adults,
        children: params.children ? Array(params.children).fill(8) : [], // default child age to 8
      },
    ];

    const body: any = {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      occupancies,
      currency: params.currency || 'USD',
      guestNationality: 'US',
    };

    if (params.cityCode) {
      body.cityCode = params.cityCode;
    } else if (params.latitude && params.longitude) {
      body.latitude = params.latitude;
      body.longitude = params.longitude;
      body.distance = 20; // 20km radius
    } else {
      throw new Error('Must provide either cityCode or latitude/longitude for search');
    }

    const response: any = await fetchLiteApi('/hotels/rates', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // LiteAPI returns a list of hotels, each having a list of rates.
    // Let's normalize it to a flat list of HotelOffer
    const offers: HotelOffer[] = [];
    
    if (response && Array.isArray(response.data)) {
      for (const hotel of response.data) {
        if (!hotel.rates || hotel.rates.length === 0) continue;

        // Take the cheapest rate or a couple of rates
        const rate = hotel.rates[0];
        
        offers.push({
          hotelId: hotel.hotelId,
          name: hotel.name || 'Unknown Hotel',
          address: hotel.address || '',
          city: hotel.city || '',
          country: hotel.country || '',
          starRating: hotel.stars || 3,
          thumbnail: hotel.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
          offerId: rate.rateId, // LiteAPI uses rateId for booking
          rateId: rate.rateId,
          roomType: rate.name || 'Standard Room',
          boardType: rate.board || 'Room Only',
          price: rate.retailRate?.amount || rate.price || 0,
          currency: rate.retailRate?.currency || rate.currency || 'USD',
          cancellationPolicy: rate.cancellationPolicies?.formatted || 'Non-refundable',
          refundable: rate.refundable || false,
        });
      }
    }

    return offers;
  } catch (error) {
    console.error('Error in searchHotels:', error);
    throw error;
  }
}

// 1. Create a checkout session (PREBOOK)
export async function prebookRate(rateId: string): Promise<HotelPrebookResult> {
  const response: any = await fetchLiteApi('/rates/prebook', {
    method: 'POST',
    body: JSON.stringify({ rateId }),
  });

  if (!response || !response.data) {
    throw new Error('Invalid prebook response from LiteAPI');
  }

  const data = response.data;
  return {
    prebookId: data.prebookId,
    hotelId: data.hotelId || '',
    name: data.hotelName || '',
    price: data.retailRate?.amount || data.price || 0,
    currency: data.retailRate?.currency || data.currency || 'USD',
    roomType: data.roomName || 'Standard Room',
    boardType: data.board || 'Room Only',
    cancellationPolicy: data.cancellationPolicies?.formatted || 'Non-refundable',
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    offerId: rateId,
    rateId: rateId,
  };
}

// 2. Complete a booking
export async function bookHotel(params: {
  prebookId: string;
  guests: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;
  paymentMethod?: string;
}): Promise<{ bookingId: string; status: string }> {
  // Map guest structure to LiteAPI expected schema
  const primaryGuest = params.guests[0];
  const body = {
    prebookId: params.prebookId,
    holder: {
      firstName: primaryGuest.firstName,
      lastName: primaryGuest.lastName,
      email: primaryGuest.email,
      phone: primaryGuest.phone,
    },
    rooms: [
      {
        guests: params.guests.map((g) => ({
          firstName: g.firstName,
          lastName: g.lastName,
        })),
      },
    ],
    paymentMethod: 'credit_card', // For sandbox
  };

  const response: any = await fetchLiteApi('/rates/book', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response || !response.data) {
    throw new Error('Invalid booking response from LiteAPI');
  }

  return {
    bookingId: response.data.bookingId,
    status: response.data.status || 'confirmed',
  };
}

// 3. Cancel booking
export async function cancelBooking(bookingId: string): Promise<boolean> {
  const response: any = await fetchLiteApi(`/bookings/${bookingId}`, {
    method: 'PUT', // LiteAPI cancel booking usually PUT `/bookings/{bookingId}` or DELETE
  });

  return response?.data?.status === 'cancelled';
}
