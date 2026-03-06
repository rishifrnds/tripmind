import { Plane, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";


export default function Landing() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary via-primary/90 to-accent relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 border border-white/20 relative z-10 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-500">
            <img src="/tripmind-logo.svg" alt="TripMind Logo" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">TripMind</h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Your AI-Powered Travel Architect</p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-4 text-sm font-medium text-foreground bg-secondary/40 p-3 rounded-2xl">
            <MapPin className="w-5 h-5 text-accent" />
            <span>Generate day-by-day itineraries instantly</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-foreground bg-secondary/40 p-3 rounded-2xl">
            <Compass className="w-5 h-5 text-success" />
            <span>Budget tracking & smart packing lists</span>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          size="lg"
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 font-bold"
        >
          {loading ? "Connecting..." : "Continue with Google"}
        </Button>

        <p className="text-center mt-8 text-xs font-medium text-muted-foreground">
          Powered by Supabase Auth
        </p>
      </div>
    </div>
  );
}
