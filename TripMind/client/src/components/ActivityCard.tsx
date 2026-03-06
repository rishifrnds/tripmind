import { Check, MapPin, Clock, IndianRupee } from "lucide-react";
import type { Activity } from "@shared/schema";
import { useUpdateActivity } from "@/hooks/use-trips";
import { cn } from "@/lib/utils";

const categoryStyles: Record<string, string> = {
  food: "bg-orange-100 text-orange-700 border-orange-200",
  stay: "bg-blue-100 text-blue-700 border-blue-200",
  travel: "bg-purple-100 text-purple-700 border-purple-200",
  activity: "bg-green-100 text-green-700 border-green-200",
  leisure: "bg-pink-100 text-pink-700 border-pink-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

export function ActivityCard({ activity }: { activity: Activity }) {
  const { mutate: updateActivity, isPending } = useUpdateActivity();

  const isDone = activity.status === 'done';

  const handleToggle = () => {
    updateActivity({
      id: activity.id,
      status: isDone ? 'planned' : 'done'
    });
  };

  const badgeStyle = categoryStyles[activity.category?.toLowerCase() || ''] || categoryStyles.default;

  return (
    <div className={cn(
      "bg-card p-5 rounded-2xl shadow-sm border border-border/60 flex gap-4 transition-all duration-300",
      isDone ? "opacity-60 bg-muted/30" : "hover:shadow-md hover:border-border"
    )}>

      {/* Timeline / Checkbox */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            isDone
              ? "bg-success border-success text-white scale-110"
              : "border-muted-foreground/30 hover:border-accent text-transparent hover:text-accent/30"
          )}
        >
          <Check className="w-4 h-4" />
        </button>
        <div className="w-px flex-1 bg-border/80 min-h-[40px]"></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className={cn(
            "font-bold text-lg leading-tight text-foreground",
            isDone && "line-through text-muted-foreground"
          )}>
            {activity.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {activity.time_slot}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={cn("text-[10px] font-bold uppercase px-2.5 py-1 rounded-md border", badgeStyle)}>
            {activity.category || 'Activity'}
          </span>
          {activity.cost ? (
            <span className="text-xs font-bold text-primary flex items-center bg-primary/5 px-2 py-1 rounded-md">
              <IndianRupee className="w-3 h-3 mr-0.5" />
              {activity.cost.toLocaleString()}
            </span>
          ) : null}
        </div>

        {activity.location && (
          <p className="text-sm text-muted-foreground flex items-start gap-1.5 mb-2">
            <MapPin className="w-4 h-4 shrink-0 text-accent/60 mt-0.5" />
            <span className="line-clamp-2">{activity.location}</span>
          </p>
        )}

        {activity.notes && (
          <div className="mt-3 p-3 bg-secondary/30 rounded-xl text-sm text-muted-foreground italic border border-border/40">
            "{activity.notes}"
          </div>
        )}
      </div>
    </div>
  );
}
