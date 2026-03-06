-- ============================================
-- TripMind: Row Level Security Policies
-- Run this in Supabase SQL Editor after push_schema.ts
-- ============================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_items ENABLE ROW LEVEL SECURITY;

-- 2. Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Trips: Users can only CRUD their own trips
CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Days: Access via trip ownership
CREATE POLICY "Users can view own days"
  ON public.days FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own days"
  ON public.days FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own days"
  ON public.days FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own days"
  ON public.days FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- 5. Activities: Access via day -> trip ownership
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (day_id IN (
    SELECT d.id FROM public.days d
    JOIN public.trips t ON d.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (day_id IN (
    SELECT d.id FROM public.days d
    JOIN public.trips t ON d.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (day_id IN (
    SELECT d.id FROM public.days d
    JOIN public.trips t ON d.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (day_id IN (
    SELECT d.id FROM public.days d
    JOIN public.trips t ON d.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

-- 6. Packing Items: Access via trip ownership
CREATE POLICY "Users can view own packing items"
  ON public.packing_items FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own packing items"
  ON public.packing_items FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own packing items"
  ON public.packing_items FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own packing items"
  ON public.packing_items FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));
