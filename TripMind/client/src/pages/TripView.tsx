import { useState } from "react";
import { useParams } from "wouter";
import { useTrip, usePackingItems, useAddPackingItem, useUpdatePackingItem } from "@/hooks/use-trips";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { ActivityCard } from "@/components/ActivityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Plus, AlertCircle, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TripView() {
  const { id } = useParams();
  const tripId = id || "";

  const { data: trip, isLoading, error } = useTrip(tripId);
  const [currentTab, setCurrentTab] = useState<string>('PLANNER');

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-danger mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Trip not found</h2>
        <p className="text-muted-foreground mt-2">This itinerary doesn't exist or was deleted.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopNav />

      {isLoading || !trip ? (
        <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
          <Skeleton className="w-full h-48 rounded-[2rem]" />
          <div className="space-y-4">
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-32 rounded-2xl" />
            <Skeleton className="w-full h-32 rounded-2xl" />
          </div>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
          {/* Header */}
          <div className="bg-primary rounded-[2rem] p-8 text-white mb-8 relative overflow-hidden shadow-xl shadow-primary/20 animate-in fade-in duration-700">
            <div className="absolute -right-4 -bottom-10 text-[150px] opacity-10 leading-none">
              {trip.cover_emoji}
            </div>
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                {trip.style}
              </div>
              <h1 className="text-4xl font-display font-extrabold mb-2">{trip.destination}</h1>
              <p className="text-primary-foreground/80 font-medium text-lg flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                {trip.budget?.toLocaleString()} Budget
              </p>
            </div>
          </div>

          {/* Content matching the selected tab */}
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {currentTab === 'PLANNER' && <PlannerTab trip={trip} />}
            {currentTab === 'PACKING' && <PackingTab tripId={trip.id} />}
            {currentTab === 'BUDGET' && <BudgetTab trip={trip} />}
          </div>
        </main>
      )}

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} tripId={tripId} />
    </div>
  );
}

// --- SUBVIEWS ---

function PlannerTab({ trip }: { trip: any }) {
  if (!trip.days || trip.days.length === 0) {
    return <div className="text-center p-10 text-muted-foreground">No itinerary generated.</div>;
  }

  return (
    <div className="space-y-10">
      {trip.days.sort((a: any, b: any) => a.day_number - b.day_number).map((day: any) => (
        <div key={day.id} className="space-y-4 relative">
          {/* Day Header */}
          <div className="sticky top-[72px] z-30 bg-background/95 backdrop-blur-xl py-3 border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="bg-accent text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-accent/20 shrink-0">
                <span className="text-[10px] font-bold uppercase leading-none opacity-80">Day</span>
                <span className="text-xl font-bold leading-none mt-0.5">{day.day_number}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{day.theme}</h3>
                <p className="text-sm text-muted-foreground font-medium">{day.activities.length} activities planned</p>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-4 pl-4 sm:pl-6 border-l-2 border-border/60 ml-6 sm:ml-8 pt-2">
            {day.activities
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((act: any) => (
              <div key={act.id} className="relative">
                {/* Timeline connector dot */}
                <div className="absolute -left-[21px] sm:-left-[29px] top-6 w-3 h-3 rounded-full bg-border border-4 border-background"></div>
                <ActivityCard activity={act} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PackingTab({ tripId }: { tripId: string }) {
  const { data: items = [], isLoading } = usePackingItems(tripId);
  const { mutate: addItem, isPending: isAdding } = useAddPackingItem();
  const { mutate: updateItem } = useUpdatePackingItem();
  const [newItem, setNewItem] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addItem({ tripId, itemName: newItem.trim(), category: 'General' }, {
      onSuccess: () => setNewItem("")
    });
  };

  const packed = items.filter((i: any) => i.is_packed);
  const unpacked = items.filter((i: any) => !i.is_packed);
  const progress = items.length === 0 ? 0 : Math.round((packed.length / items.length) * 100);

  if (isLoading) return <Skeleton className="w-full h-64 rounded-2xl" />;

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">Packing Progress</h3>
            <p className="text-sm text-muted-foreground">{packed.length} of {items.length} packed</p>
          </div>
          <span className="text-3xl font-display font-bold text-accent">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <Input
          placeholder="Add something to pack..."
          className="h-14 bg-card border-border/60 rounded-2xl text-base px-5 shadow-sm"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Button
          type="submit"
          disabled={isAdding || !newItem.trim()}
          className="h-14 w-14 rounded-2xl bg-primary text-white shrink-0 shadow-lg shadow-primary/20"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </form>

      {/* List */}
      <div className="bg-card rounded-3xl overflow-hidden border border-border/50 shadow-sm">
        {unpacked.length > 0 && (
          <div className="p-4 border-b border-border/50 bg-secondary/20">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">To Pack</h4>
            <div className="space-y-1">
              {unpacked.map((item: any) => (
                <PackingRow key={item.id} item={item} onToggle={(val) => updateItem({ id: item.id, isPacked: val, tripId })} />
              ))}
            </div>
          </div>
        )}

        {packed.length > 0 && (
          <div className="p-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Packed</h4>
            <div className="space-y-1 opacity-70">
              {packed.map((item: any) => (
                <PackingRow key={item.id} item={item} onToggle={(val) => updateItem({ id: item.id, isPacked: val, tripId })} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            No items yet. Add something above!
          </div>
        )}
      </div>
    </div>
  );
}

function PackingRow({ item, onToggle }: { item: any, onToggle: (val: boolean) => void }) {
  return (
    <label className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors group">
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.is_packed ? 'bg-success border-success text-white' : 'border-muted-foreground/30 group-hover:border-accent text-transparent'}`}>
        <Check className="w-4 h-4" />
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={item.is_packed}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span className={`font-medium text-base ${item.is_packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {item.item_name}
      </span>
    </label>
  );
}

function BudgetTab({ trip }: { trip: any }) {
  // Calculate expenses from activities
  let totalExpenses = 0;
  const expensesByCategory: Record<string, number> = {};

  trip.days?.forEach((day: any) => {
    day.activities?.forEach((act: any) => {
      const cost = act.cost || 0;
      totalExpenses += cost;
      const cat = act.category || 'General';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + cost;
    });
  });

  const remaining = Math.max(0, (trip.budget || 0) - totalExpenses);
  const overBudget = totalExpenses > (trip.budget || 0);
  const percentUsed = trip.budget ? Math.min(100, Math.round((totalExpenses / trip.budget) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border/50">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-foreground">₹{trip.budget?.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border/50">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className={`p-8 rounded-3xl shadow-sm border ${overBudget ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success-foreground'}`}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="font-bold text-xl text-foreground">
              {overBudget ? 'Over Budget By' : 'Remaining Funds'}
            </h3>
          </div>
          <span className="text-3xl font-display font-bold">
            ₹{overBudget ? (totalExpenses - trip.budget).toLocaleString() : remaining.toLocaleString()}
          </span>
        </div>

        <div className="h-4 w-full bg-white/50 rounded-full overflow-hidden mt-6">
          <div
            className={`h-full transition-all duration-1000 ${overBudget ? 'bg-danger' : 'bg-success'}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <p className="text-sm font-medium mt-3 text-foreground/70">{percentUsed}% of budget allocated</p>
      </div>

      {Object.keys(expensesByCategory).length > 0 && (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
          <h3 className="font-bold text-lg text-foreground mb-6">Expenses by Category</h3>
          <div className="space-y-4">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="flex items-center gap-4">
                  <div className="w-full flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm text-foreground capitalize">{category}</span>
                      <span className="font-bold text-sm text-primary">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent/60 rounded-full" style={{ width: `${Math.round((amount / totalExpenses) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
