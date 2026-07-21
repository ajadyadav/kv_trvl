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

const citiesToSeed = [
  { city_name: 'New York', country_code: 'US', liteapi_city_code: '19472' },
  { city_name: 'London', country_code: 'GB', liteapi_city_code: '14238' },
  { city_name: 'Paris', country_code: 'FR', liteapi_city_code: '18632' },
  { city_name: 'Tokyo', country_code: 'JP', liteapi_city_code: '23236' },
  { city_name: 'Singapore', country_code: 'SG', liteapi_city_code: '21324' },
  { city_name: 'Rome', country_code: 'IT', liteapi_city_code: '20231' },
  { city_name: 'Barcelona', country_code: 'ES', liteapi_city_code: '2321' },
  { city_name: 'Dubai', country_code: 'AE', liteapi_city_code: '7921' },
  { city_name: 'Sydney', country_code: 'AU', liteapi_city_code: '22112' },
  { city_name: 'Bangkok', country_code: 'TH', liteapi_city_code: '2212' },
  { city_name: 'Hong Kong', country_code: 'HK', liteapi_city_code: '11345' },
  { city_name: 'Istanbul', country_code: 'TR', liteapi_city_code: '12023' },
  { city_name: 'Los Angeles', country_code: 'US', liteapi_city_code: '15432' },
  { city_name: 'San Francisco', country_code: 'US', liteapi_city_code: '20812' },
  { city_name: 'Miami', country_code: 'US', liteapi_city_code: '16523' },
  { city_name: 'Chicago', country_code: 'US', liteapi_city_code: '5231' },
  { city_name: 'Amsterdam', country_code: 'NL', liteapi_city_code: '823' },
  { city_name: 'Berlin', country_code: 'DE', liteapi_city_code: '2812' },
  { city_name: 'Madrid', country_code: 'ES', liteapi_city_code: '16124' },
  { city_name: 'Munich', country_code: 'DE', liteapi_city_code: '17231' },
  { city_name: 'Vienna', country_code: 'AT', liteapi_city_code: '24123' },
  { city_name: 'Prague', country_code: 'CZ', liteapi_city_code: '19823' },
  { city_name: 'Seoul', country_code: 'KR', liteapi_city_code: '21012' },
  { city_name: 'Mumbai', country_code: 'IN', liteapi_city_code: '17012' },
  { city_name: 'New Delhi', country_code: 'IN', liteapi_city_code: '19231' },
  { city_name: 'Cape Town', country_code: 'ZA', liteapi_city_code: '4812' },
  { city_name: 'Rio de Janeiro', country_code: 'BR', liteapi_city_code: '20124' },
  { city_name: 'Toronto', country_code: 'CA', liteapi_city_code: '23321' },
  { city_name: 'Vancouver', country_code: 'CA', liteapi_city_code: '24102' },
  { city_name: 'Melbourne', country_code: 'AU', liteapi_city_code: '16231' },
];

async function seed() {
  console.log('Starting cities seeding...');
  
  // Clear existing cities
  const { error: deleteError } = await supabase.from('cities').delete().neq('id', 0);
  if (deleteError) {
    console.error('Error clearing old cities:', deleteError.message);
  }

  // Insert new cities
  const { data, error } = await supabase.from('cities').insert(citiesToSeed).select();
  if (error) {
    console.error('Error seeding cities:', error.message);
  } else {
    console.log(`Successfully seeded ${data?.length} cities!`);
  }
}

seed();
