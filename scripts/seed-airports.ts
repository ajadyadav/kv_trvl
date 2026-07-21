import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Helper to load env variables from .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const airportsToSeed = [
  { airport_name: 'John F. Kennedy International Airport', iata_code: 'JFK', city: 'New York', country: 'United States' },
  { airport_name: 'Los Angeles International Airport', iata_code: 'LAX', city: 'Los Angeles', country: 'United States' },
  { airport_name: 'London Heathrow Airport', iata_code: 'LHR', city: 'London', country: 'United Kingdom' },
  { airport_name: 'Paris Charles de Gaulle Airport', iata_code: 'CDG', city: 'Paris', country: 'France' },
  { airport_name: 'Tokyo Haneda Airport', iata_code: 'HND', city: 'Tokyo', country: 'Japan' },
  { airport_name: 'Singapore Changi Airport', iata_code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { airport_name: 'Dubai International Airport', iata_code: 'DXB', city: 'Dubai', country: 'United Arab Emirates' },
  { airport_name: 'Kingsford Smith Airport', iata_code: 'SYD', city: 'Sydney', country: 'Australia' },
  { airport_name: 'Suvarnabhumi Airport', iata_code: 'BKK', city: 'Bangkok', country: 'Thailand' },
  { airport_name: 'Hong Kong International Airport', iata_code: 'HKG', city: 'Hong Kong', country: 'Hong Kong' },
  { airport_name: 'Istanbul Airport', iata_code: 'IST', city: 'Istanbul', country: 'Turkey' },
  { airport_name: 'San Francisco International Airport', iata_code: 'SFO', city: 'San Francisco', country: 'United States' },
  { airport_name: 'Miami International Airport', iata_code: 'MIA', city: 'Miami', country: 'United States' },
  { airport_name: 'O\'Hare International Airport', iata_code: 'ORD', city: 'Chicago', country: 'United States' },
  { airport_name: 'Amsterdam Airport Schiphol', iata_code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
  { airport_name: 'Berlin Brandenburg Airport', iata_code: 'BER', city: 'Berlin', country: 'Germany' },
  { airport_name: 'Adolfo Suárez Madrid–Barajas Airport', iata_code: 'MAD', city: 'Madrid', country: 'Spain' },
  { airport_name: 'Munich Airport', iata_code: 'MUC', city: 'Munich', country: 'Germany' },
  { airport_name: 'Vienna International Airport', iata_code: 'VIE', city: 'Vienna', country: 'Austria' },
  { airport_name: 'Václav Havel Airport Prague', iata_code: 'PRG', city: 'Prague', country: 'Czech Republic' },
  { airport_name: 'Incheon International Airport', iata_code: 'ICN', city: 'Seoul', country: 'South Korea' },
  { airport_name: 'Chhatrapati Shivaji Maharaj International Airport', iata_code: 'BOM', city: 'Mumbai', country: 'India' },
  { airport_name: 'Indira Gandhi International Airport', iata_code: 'DEL', city: 'New Delhi', country: 'India' },
  { airport_name: 'Cape Town International Airport', iata_code: 'CPT', city: 'Cape Town', country: 'South Africa' },
  { airport_name: 'Galeão International Airport', iata_code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil' },
  { airport_name: 'Toronto Pearson International Airport', iata_code: 'YYZ', city: 'Toronto', country: 'Canada' },
  { airport_name: 'Vancouver International Airport', iata_code: 'YVR', city: 'Vancouver', country: 'Canada' },
  { airport_name: 'Melbourne Airport', iata_code: 'MEL', city: 'Melbourne', country: 'Australia' },
];

async function seed() {
  console.log('Starting airports seeding...');

  // Clear existing airports
  const { error: deleteError } = await supabase.from('airports').delete().neq('id', 0);
  if (deleteError) {
    console.error('Error clearing old airports:', deleteError.message);
  }

  // Insert new airports
  const { data, error } = await supabase.from('airports').insert(airportsToSeed).select();
  if (error) {
    console.error('Error seeding airports:', error.message);
  } else {
    console.log(`Successfully seeded ${data?.length} airports!`);
  }
}

seed();
