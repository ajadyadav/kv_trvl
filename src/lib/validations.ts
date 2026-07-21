import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
});

// ─── Hotel Search ─────────────────────────────────────────────────────────────
const today = () => new Date();
today.toString = () => 'today';

export const hotelSearchSchema = z.object({
  destination: z.string().min(2, 'Please enter a destination'),
  cityCode: z.string().optional(),
  checkIn: z.string().refine((d) => {
    const date = new Date(d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
  }, 'Check-in date cannot be in the past'),
  checkOut: z.string(),
  adults: z.number().int().min(1).max(10),
  children: z.number().int().min(0).max(10).default(0),
  rooms: z.number().int().min(1).max(10),
}).refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

// ─── Flight Search ────────────────────────────────────────────────────────────
export const flightSearchSchema = z.object({
  origin: z.string().min(3, 'Please enter an origin'),
  originIata: z.string().length(3, 'Invalid IATA code'),
  destination: z.string().min(3, 'Please enter a destination'),
  destinationIata: z.string().length(3, 'Invalid IATA code'),
  departureDate: z.string().refine((d) => {
    const date = new Date(d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
  }, 'Departure date cannot be in the past'),
  returnDate: z.string().optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9).default(0),
  infants: z.number().int().min(0).max(4).default(0),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']),
}).refine((d) => {
  if (!d.returnDate) return true;
  return new Date(d.returnDate) > new Date(d.departureDate);
}, { message: 'Return date must be after departure', path: ['returnDate'] });

// ─── Guest Details ────────────────────────────────────────────────────────────
export const guestDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone number is required').max(20),
});

export const passengerDetailsSchema = guestDetailsSchema.extend({
  dateOfBirth: z.string().refine((d) => {
    const date = new Date(d);
    const now = new Date();
    return date < now;
  }, 'Date of birth must be in the past'),
  passportNumber: z.string().min(5, 'Passport number is required').max(20),
  passportExpiry: z.string().refine((d) => {
    return new Date(d) > new Date();
  }, 'Passport must not be expired'),
  nationality: z.string().length(2, 'Use 2-letter country code'),
});

export const hotelBookingFormSchema = z.object({
  guests: z.array(guestDetailsSchema).min(1),
  specialRequests: z.string().max(500).optional(),
});

export const flightBookingFormSchema = z.object({
  passengers: z.array(passengerDetailsSchema).min(1),
  contactEmail: z.string().email('Invalid email'),
  contactPhone: z.string().min(7, 'Phone number is required'),
});

// ─── API Request Bodies ───────────────────────────────────────────────────────
export const hotelBookingRequestSchema = z.object({
  prebookId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  guests: z.array(guestDetailsSchema),
  specialRequests: z.string().optional(),
  // Search snapshot passed from client, validated server-side
  searchSnapshot: z.record(z.string(), z.unknown()),
  offerSnapshot: z.record(z.string(), z.unknown()),
});

export const cancelBookingRequestSchema = z.object({
  bookingId: z.string().uuid(),
  litaapiBookingId: z.string().min(1),
});
