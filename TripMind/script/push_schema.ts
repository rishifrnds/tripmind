import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP FUNCTION IF EXISTS public.save_trip_atomic CASCADE;
DROP TABLE IF EXISTS public.packing_items CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.days CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- 2. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text NOT NULL,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  total_cost numeric DEFAULT 0,
  style text,
  cover_emoji text,
  created_at timestamptz DEFAULT now()
);

-- 3. Days Table
CREATE TABLE IF NOT EXISTS public.days (
  id serial PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  date date,
  theme text,
  summary text,
  UNIQUE(trip_id, day_number)
);

-- 4. Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id serial PRIMARY KEY,
  day_id int NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  title text NOT NULL,
  time_slot time,
  category text,
  cost numeric DEFAULT 0,
  location text,
  notes text,
  status text DEFAULT 'planned',
  sort_order int DEFAULT 0
);

-- 5. Packing Items Table
CREATE TABLE IF NOT EXISTS public.packing_items (
  id serial PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  category text,
  is_packed boolean DEFAULT false
);

-- Atomic RPC to save a full trip with its days and activities in one transaction
CREATE OR REPLACE FUNCTION save_trip_atomic(
  p_user_id uuid,
  p_title text,
  p_destination text,
  p_start_date date,
  p_end_date date,
  p_budget numeric,
  p_style text,
  p_cover_emoji text,
  p_days jsonb -- Array of days, each containing an array of activities
) RETURNS uuid AS $$
DECLARE
  v_trip_id uuid;
  v_day_id int;
  v_day jsonb;
  v_activity jsonb;
BEGIN
  -- 1. Insert Trip
  INSERT INTO public.trips (user_id, title, destination, start_date, end_date, budget, style, cover_emoji)
  VALUES (p_user_id, p_title, p_destination, p_start_date, p_end_date, p_budget, p_style, p_cover_emoji)
  RETURNING id INTO v_trip_id;

  -- 2. Loop through Days
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days)
  LOOP
    INSERT INTO public.days (trip_id, day_number, theme, summary)
    VALUES (v_trip_id, (v_day->>'dayNumber')::int, v_day->>'theme', v_day->>'summary')
    RETURNING id INTO v_day_id;

    -- 3. Loop through Activities inside each Day
    IF v_day ? 'activities' THEN
      FOR v_activity IN SELECT * FROM jsonb_array_elements(v_day->'activities')
      LOOP
        INSERT INTO public.activities (day_id, title, time_slot, category, cost, location, notes)
        VALUES (
          v_day_id,
          v_activity->>'title',
          (v_activity->>'timeSlot')::time,
          v_activity->>'category',
          COALESCE((v_activity->>'cost')::numeric, 0),
          v_activity->>'location',
          v_activity->>'notes'
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN v_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function runSQL() {
  try {
    await pool.query(schema);
    console.log("Schema applied successfully to Supabase!");
  } catch (err) {
    console.error("SQL Error:", err);
  } finally {
    pool.end();
  }
}

runSQL();
