// ─── Booking ──────────────────────────────────────────────────────────────────
export type BookingType = 'hotel' | 'flight';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'failed';
export type PaymentStatus = 'mock_paid' | 'refunded';

export interface Booking {
  id: string;
  user_id: string;
  booking_type: BookingType;
  liteapi_booking_id: string | null;
  idempotency_key: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  search_snapshot: Record<string, unknown>;
  offer_snapshot: Record<string, unknown>;
  guest_details: Record<string, unknown>;
  total_price: number;
  currency: string;
  check_in: string | null;
  check_out: string | null;
  departure_date: string | null;
  return_date: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

// ─── LiteAPI – Hotels ─────────────────────────────────────────────────────────
export interface HotelOffer {
  hotelId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  thumbnail: string;
  offerId: string;
  rateId: string;
  roomType: string;
  boardType: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  refundable: boolean;
}

export interface HotelSearchParams {
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms: number;
  currency?: string;
}

export interface HotelPrebookResult {
  prebookId: string;
  hotelId: string;
  name: string;
  price: number;
  currency: string;
  roomType: string;
  boardType: string;
  cancellationPolicy: string;
  checkIn: string;
  checkOut: string;
  offerId: string;
  rateId: string;
}

// ─── LiteAPI – Flights ────────────────────────────────────────────────────────
export interface FlightOffer {
  offerId: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  cabinClass: string;
  price: number;
  currency: string;
  refundable: boolean;
  baggageAllowance: string;
}

export interface FlightSearchParams {
  originIata: string;
  destinationIata: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
}

// ─── Autosuggest ──────────────────────────────────────────────────────────────
export interface CitySuggestion {
  city_name: string;
  country_code: string | null;
  liteapi_city_code: string | null;
}

export interface AirportSuggestion {
  airport_name: string;
  iata_code: string;
  city: string | null;
  country: string | null;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Guest / Passenger Details ────────────────────────────────────────────────
export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PassengerDetails extends GuestDetails {
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}

// ─── Forms ────────────────────────────────────────────────────────────────────
export interface HotelBookingFormData {
  guests: GuestDetails[];
  specialRequests?: string;
}

export interface FlightBookingFormData {
  passengers: PassengerDetails[];
  contactEmail: string;
  contactPhone: string;
}
