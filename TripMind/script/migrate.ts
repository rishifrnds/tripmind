import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const migration = `
-- Add cover_emoji column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trips' AND column_name = 'cover_emoji'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN cover_emoji text;
  END IF;
END $$;

-- Add summary column to days if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'days' AND column_name = 'summary'
  ) THEN
    ALTER TABLE public.days ADD COLUMN summary text;
  END IF;
END $$;

-- Re-create the RPC function with cover_emoji parameter and auth validation
CREATE OR REPLACE FUNCTION save_trip_atomic(
  p_user_id uuid,
  p_title text,
  p_destination text,
  p_start_date date,
  p_end_date date,
  p_budget numeric,
  p_style text,
  p_cover_emoji text,
  p_days jsonb
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

async function runMigration() {
    try {
        await pool.query(migration);
        console.log("Migration applied successfully!");
        console.log("  - cover_emoji column added to trips (if missing)");
        console.log("  - summary column added to days (if missing)");
        console.log("  - save_trip_atomic function updated with cover_emoji + auth validation");
    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        pool.end();
    }
}

runMigration();
