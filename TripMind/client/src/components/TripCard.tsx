import { Link } from "wouter";
import type { Trip } from "@shared/schema";
import { MapPin, IndianRupee } from "lucide-react";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div className="bg-card rounded-[2rem] overflow-hidden shadow-md shadow-primary/5 border border-border/50 hover:shadow-xl hover:shadow-primary/10 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300">
        <div className="h-32 bg-gradient-to-br from-primary/5 to-accent/10 relative flex items-center justify-center text-5xl">
          <span className="transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
            {trip.cover_emoji || '✈️'}
          </span>
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-primary shadow-sm">
              {trip.style || 'Custom'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2 truncate group-hover:text-accent transition-colors">
            {trip.destination}
          </h3>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent/70" />
                <span className="font-medium truncate max-w-[120px]">{trip.title}</span>
              </div>

              <div className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-success/70" />
                <span className="font-bold text-success">
                  {trip.budget?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
