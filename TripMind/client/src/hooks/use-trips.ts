import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Trip, Day, Activity, PackingItem } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export type TripWithDetails = Trip & {
  days: (Day & { activities: Activity[] })[],
  packingItems: PackingItem[]
};

// Fetch all trips
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
  });
}

// Fetch single trip with days and activities
export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      if (!id) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data: trip, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (tripErr) throw tripErr;

      const { data: days, error: daysErr } = await supabase
        .from('days')
        .select('*')
        .eq('trip_id', id)
        .order('day_number', { ascending: true });

      if (daysErr) throw daysErr;

      const { data: activities, error: actErr } = await supabase
        .from('activities')
        .select('*')
        .in('day_id', days.map(d => d.id))
        .order('sort_order', { ascending: true });

      if (actErr && days.length > 0) throw actErr;

      const { data: packingItems, error: packErr } = await supabase
        .from('packing_items')
        .select('*')
        .eq('trip_id', id);

      if (packErr) throw packErr;

      // Assemble nested structure
      const daysWithActivities = days.map(day => ({
        ...day,
        activities: (activities || []).filter(a => a.day_id === day.id)
      }));

      return {
        ...trip,
        days: daysWithActivities,
        packingItems: packingItems || []
      } as TripWithDetails;
    },
    enabled: !!id,
  });
}

// Complex mutation: Generate Itinerary -> Create Trip -> Create Days -> Create Activities
export function useGenerateTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { destination: string; days: number; budget: number; style: string; coverEmoji: string }) => {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 1. Generate via Gemini
      const prompt = `You are a travel expert. Return ONLY valid JSON with no markdown fences. Plan a ${data.days}-day trip to ${data.destination}. Budget: ₹${data.budget}. Travel style: ${data.style}. Return this exact JSON structure: {"days":[{"dayNumber":1,"theme":"Day theme string","summary":"Summary string","activities":[{"title":"Activity name","timeSlot":"09:00 AM","category":"food","cost":500,"location":"Exact place name","notes":"Helpful tip"}]}]}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      let generated;
      try {
        generated = JSON.parse(text);
      } catch (e) {
        throw new Error("AI returned invalid data. Please try again.");
      }

      // 2. We use Supabase RPC to save atomically!
      const { data: tripId, error } = await supabase.rpc('save_trip_atomic', {
        p_user_id: user.id,
        p_title: `${data.destination} - ${data.style} Trip`,
        p_destination: data.destination,
        p_start_date: new Date().toISOString().split('T')[0],
        p_end_date: new Date(Date.now() + data.days * 86400000).toISOString().split('T')[0],
        p_budget: data.budget,
        p_style: data.style,
        p_cover_emoji: data.coverEmoji,
        p_days: generated.days
      });

      if (error) {
        console.error(error);
        throw new Error("Failed to save trip to database");
      }

      return tripId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (err: any) => {
      toast({
        title: "Generation Failed",
        description: err.message || "Something went wrong while crafting your trip.",
        variant: "destructive"
      });
    }
  });
}

// Update Activity Status (e.g., mark as done)
export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; status?: string; cost?: number; title?: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    }
  });
}

// Delete Trip
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });
}

// Fetch Packing Items
export function usePackingItems(tripId: string) {
  return useQuery({
    queryKey: ['packing', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const { data, error } = await supabase
        .from('packing_items')
        .select('*')
        .eq('trip_id', tripId);

      if (error) throw error;
      return data as PackingItem[];
    },
    enabled: !!tripId
  });
}

// Add Packing Item
export function useAddPackingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, itemName, category }: { tripId: string, itemName: string, category: string }) => {
      const { data, error } = await supabase
        .from('packing_items')
        .insert([{ trip_id: tripId, item_name: itemName, category }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    }
  });
}

// Update Packing Item
export function useUpdatePackingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPacked, tripId }: { id: number; isPacked: boolean; tripId: string }) => {
      const { data, error } = await supabase
        .from('packing_items')
        .update({ is_packed: isPacked })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packing', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    }
  });
}
