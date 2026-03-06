import { useAuth } from "@/hooks/use-auth";
import { useTrips } from "@/hooks/use-trips";
import { TopNav } from "@/components/TopNav";
import { TripCard } from "@/components/TripCard";
import { BottomNav } from "@/components/BottomNav";
import { Plus, Compass } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trips, isLoading } = useTrips();

  return (
    <div className="min-h-screen pb-24 bg-background">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-4xl font-display font-extrabold text-foreground">My Trips</h1>
            <p className="text-muted-foreground mt-2 font-medium text-lg">Your next adventure awaits, {user?.user_metadata?.full_name?.split(' ')[0] || 'Explorer'}</p>
          </div>

          <Link href="/new" className="inline-flex">
            <button className="bg-primary text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 hover:bg-primary/95 transition-all duration-300 w-full sm:w-auto animate-in slide-in-from-right duration-500">
              <Plus className="w-5 h-5" />
              Plan New Trip
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-card border border-border/50 p-6 flex flex-col">
                <Skeleton className="w-full h-24 rounded-xl mb-4" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="bg-card rounded-[2.5rem] p-12 text-center border border-border shadow-sm animate-in zoom-in-95 duration-500 max-w-2xl mx-auto mt-12">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-3">No trips yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">
              Generate your first AI-powered itinerary tailored perfectly to your style and budget.
            </p>
            <Link href="/new">
              <button className="bg-accent text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-1 transition-all duration-300">
                Create First Trip
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, i) => (
              <div key={trip.id} className="animate-in zoom-in-95" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
