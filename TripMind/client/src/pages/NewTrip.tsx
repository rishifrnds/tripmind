import { useState } from "react";
import { useLocation } from "wouter";
import { useGenerateTrip } from "@/hooks/use-trips";
import { TopNav } from "@/components/TopNav";
import { ArrowLeft, Sparkles, MapPin, Calendar, IndianRupee, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import confetti from "canvas-confetti";

export default function NewTrip() {
  const [, setLocation] = useLocation();
  const { mutate: generateTrip, isPending } = useGenerateTrip();
  
  const [form, setForm] = useState({
    destination: "",
    days: 3,
    budget: 20000,
    style: "Heritage",
    coverEmoji: "✈️"
  });

  const emojis = ["✈️", "🌴", "🏛️", "🍜", "🏔️", "🏖️", "🎒", "🏰", "🌆"];
  const styles = ["Heritage", "Food & Culture", "Relaxation", "Adventure", "Nightlife", "Nature"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.destination) return;
    
    generateTrip(form, {
      onSuccess: (tripId) => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#059669', '#1E3A5F']
        });
        setLocation(`/trips/${tripId}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopNav />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setLocation('/')}
            className="p-3 bg-card rounded-xl shadow-sm border border-border/50 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-3xl font-display font-extrabold text-foreground">Plan New Trip</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-border/60 space-y-8 relative overflow-hidden">
          
          {isPending && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[2.5rem]">
              <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-6"></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Crafting Magic...</h3>
              <p className="text-muted-foreground font-medium animate-pulse">Consulting local experts & crunching numbers</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Destination
              </label>
              <Input 
                required
                placeholder="e.g. Rajasthan, India" 
                className="h-14 px-5 rounded-2xl text-lg font-medium bg-secondary/30 border-transparent focus:bg-card focus:border-accent focus:ring-accent/20 transition-all"
                value={form.destination}
                onChange={e => setForm({...form, destination: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Days
                </label>
                <Input 
                  type="number" 
                  min="1" max="14" required
                  className="h-14 px-5 rounded-2xl text-lg font-medium bg-secondary/30 border-transparent focus:bg-card focus:border-accent"
                  value={form.days}
                  onChange={e => setForm({...form, days: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" /> Budget (₹)
                </label>
                <Input 
                  type="number" 
                  min="1000" step="500" required
                  className="h-14 px-5 rounded-2xl text-lg font-medium bg-secondary/30 border-transparent focus:bg-card focus:border-accent"
                  value={form.budget}
                  onChange={e => setForm({...form, budget: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Style
                </label>
                <Select value={form.style} onValueChange={(val) => setForm({...form, style: val})}>
                  <SelectTrigger className="h-14 px-5 rounded-2xl text-base font-medium bg-secondary/30 border-transparent focus:bg-card focus:border-accent">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-xl">
                    {styles.map(s => <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Cover Emoji
                </label>
                <div className="h-14 flex items-center justify-between px-2 bg-secondary/30 rounded-2xl">
                  {emojis.slice(0, 5).map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({...form, coverEmoji: emoji})}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.coverEmoji === emoji ? 'bg-white shadow-md scale-110' : 'hover:bg-black/5'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !form.destination} 
            className="w-full h-16 rounded-2xl bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 hover:shadow-accent/40 text-lg font-bold flex items-center justify-center gap-3 transition-all"
          >
            <Sparkles className="w-6 h-6" />
            Generate Magic Itinerary
          </Button>
        </form>
      </main>
    </div>
  );
}
